import { db } from "./firebase";
import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, 
  query, where, orderBy, limit, setDoc, Timestamp, 
  collectionGroup, documentId 
} from "firebase/firestore";

// Helper to get row letter (1->A, 2->B, etc.)
const getRowLabel = (index) => String.fromCharCode(65 + index - 1);
// Helper to get row index (A->1, B->2, etc.)
const getRowIndex = (label) => label.charCodeAt(0) - 64;

class LocalDB {
    // === SEEDING ===
    async seed() {
        try {
            const collegesRef = collection(db, "colleges");
            const snapshot = await getDocs(collegesRef);
            
            if (snapshot.empty) {
                console.log("Seeding database...");
                // Create College
                const collegeRef = await this.createCollege({
                    name: "Tech Institute of Science",
                    superAdminUsername: "superadmin",
                    superAdminPassword: "password123"
                });
                
                // createCollege returns the new college object with id
                const collegeId = collegeRef.id;

                // Create Admin
                await this.createUser({
                    collegeId: collegeId,
                    username: "admin",
                    password: "password123",
                    role: "admin"
                });

                // Create Guard
                await this.createUser({
                    collegeId: collegeId,
                    username: "guard",
                    password: "password123",
                    role: "guard"
                });

                // Create Hall (for testing "Use Existing Hall")
                const hall = await this.createHall({
                    collegeId: collegeId,
                    hallName: "Main Auditorium",
                    rows: { "A": 10, "B": 10, "C": 12 } // App format
                });

                // Create Seminar (Custom Grid)
                await this.createSeminar({
                    collegeId: collegeId,
                    title: "AI & Future of Tech",
                    description: "A deep dive into Artificial Intelligence trends.",
                    date: "2025-05-15",
                    time: "10:00",
                    venue: "Conference Room 1",
                    rows: 10,
                    cols: 10,
                    slug: "ai-future-tech",
                    thumbnail: "",
                    seatingSource: "GRID",
                    rowConfig: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10 } // App format
                });
                
                console.log("Seeding complete.");
            }
        } catch (error) {
            console.error("Error seeding database:", error);
        }
    }

    // === COLLEGES ===
    async getColleges() {
        const colRef = collection(db, "colleges");
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getCollege(id) {
        if (!id) return null;
        const docRef = doc(db, "colleges", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }

    async getCollegeBySlug(slug) {
        if (!slug) return null;
        // Try direct ID match (if slug is used as ID)
        const docRef = doc(db, "colleges", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        
        // Fallback: Query by custom 'slug' field or 'name' (if legacy)
        // Ideally we should use ID as slug as per prompt, but for robustness:
        const q = query(collection(db, "colleges"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
             const d = snap.docs[0];
             return { id: d.id, ...d.data() };
        }
        
        // Fallback: Query by name (legacy support)
        // This is risky if names have spaces, but user URLs suggest names are used.
        // We might need to decodeURI the slug if it comes from URL.
        const decodedSlug = decodeURIComponent(slug);
        const qName = query(collection(db, "colleges"), where("name", "==", decodedSlug), limit(1));
        const snapName = await getDocs(qName);
        if (!snapName.empty) {
             const d = snapName.docs[0];
             return { id: d.id, ...d.data() };
        }

        return null;
    }

    async createCollege(insertCollege) {
        // insertCollege: { name, superAdminUsername, superAdminPassword, slug (optional) }
        const colRef = collection(db, "colleges");
        
        // Generate slug if not provided
        let slug = insertCollege.slug;
        if (!slug) {
            slug = insertCollege.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        const newCollege = {
            name: insertCollege.name,
            slug: slug, // Store slug explicitly
            createdAt: new Date().toISOString(),
            superAdminUsername: insertCollege.superAdminUsername,
            superAdminPassword: insertCollege.superAdminPassword
        };

        // Use slug as Document ID as per Master Prompt "colleges/{collegeSlug}"
        // But we must check if it exists to avoid overwrite? 
        // addDoc doesn't allow setting ID. setDoc does.
        // We'll try to use slug as ID.
        const docRef = doc(colRef, slug);
        // Check existence
        const existing = await getDoc(docRef);
        if (existing.exists()) {
             throw new Error("College URL already exists. Please choose a different name.");
        }
        
        await setDoc(docRef, newCollege);
        
        // Auto-create super admin
        await this.createUser({
            collegeId: docRef.id,
            username: insertCollege.superAdminUsername,
            password: insertCollege.superAdminPassword,
            role: "superadmin"
        });

        return { id: docRef.id, ...newCollege };
    }

    // === USERS ===
    async createUser(insertUser) {
        // insertUser: { collegeId, username, password, role }
        const usersRef = collection(db, "colleges", insertUser.collegeId, "users");
        // Check if username exists? (Optional but good)
        // For now, blindly add as per local-db logic
        const newUser = {
            collegeId: insertUser.collegeId,
            username: insertUser.username,
            role: insertUser.role,
            // Storing plaintext password as requested by prompt "keep plaintext only if already used"
            passwordHash: insertUser.password, 
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(usersRef, newUser);
        return { id: docRef.id, ...newUser };
    }

    async getUsersByCollege(collegeId) {
        const usersRef = collection(db, "colleges", collegeId, "users");
        const q = query(usersRef, where("collegeId", "==", collegeId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // === AUTH ===
    async login(creds) {
        // creds: { collegeId, username, password }
        const college = await this.getCollege(creds.collegeId);
        if (!college) {
            throw new Error("College not found");
        }
        const directMatch =
            (creds.username === college.name && creds.password === college.superAdminPassword) ||
            (creds.username === college.superAdminUsername && creds.password === college.superAdminPassword);
        if (directMatch) {
            const user = {
                id: `superadmin-${college.id}`,
                collegeId: college.id,
                username: college.superAdminUsername,
                role: "superadmin",
                passwordHash: college.superAdminPassword,
                createdAt: new Date().toISOString()
            };
            return { user, college, redirectUrl: "/superadmin/dashboard" };
        }
        const usersRef = collection(db, "colleges", creds.collegeId, "users");
        const q = query(
            usersRef, 
            where("collegeId", "==", creds.collegeId),
            where("username", "==", creds.username)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            throw new Error("Invalid credentials");
        }

        // Check password (finding the first match)
        const userDoc = snapshot.docs.find(d => d.data().passwordHash === creds.password);
        
        if (!userDoc) {
            throw new Error("Invalid credentials");
        }

        const user = { id: userDoc.id, ...userDoc.data() };
 
        let redirectUrl = "/";
        if (user.role === "superadmin") redirectUrl = "/superadmin/dashboard";
        if (user.role === "admin") redirectUrl = "/admin/dashboard";
        if (user.role === "guard") redirectUrl = "/guard/dashboard";

        return { user, college, redirectUrl };
    }

    // === SEMINARS ===
    async getSeminars(collegeId) {
        const seminarsRef = collection(db, "colleges", collegeId, "seminars");
        const q = query(seminarsRef, where("collegeId", "==", collegeId));
        const snapshot = await getDocs(q);
        
        // We don't need to resolve layouts for the list view, but it doesn't hurt to be consistent.
        // However, for performance, we might skip fetching halls here unless strictly needed.
        // The AdminDashboard only displays title, date, etc.
        return snapshot.docs.map(doc => {
             const data = doc.data();
             // Ensure defaults
             return { id: doc.id, ...data };
        });
    }

    async getSeminar(collegeId, id) {
        if (!collegeId || !id) return null;
        const docRef = doc(db, "colleges", collegeId, "seminars", id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) return null;
        return this._resolveSeminarLayout({ id: docSnap.id, ...docSnap.data() });
    }

    async getSeminarByCollegeAndSlug(collegeSlug, seminarSlug) {
        // 1. Resolve College
        const college = await this.getCollegeBySlug(collegeSlug);
        if (!college) return null;

        // 2. Query Seminars Subcollection
        const seminarsRef = collection(db, "colleges", college.id, "seminars");
        const q = query(seminarsRef, where("slug", "==", seminarSlug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        const docSnap = snapshot.docs[0];
        return this._resolveSeminarLayout({ id: docSnap.id, ...docSnap.data() });
    }

    // Deprecated global search, kept for legacy or if needed
    async getSeminarBySlug(slug) {
        // Try to find via collectionGroup if strict isolation isn't enforced yet
        // But per master prompt, we should avoid this. 
        // We'll keep the logic but log a warning.
        console.warn("Using deprecated global seminar search. Prefer getSeminarByCollegeAndSlug.");
        
        try {
            const cg = query(collectionGroup(db, "seminars"), where("slug", "==", slug), limit(1));
            const cgSnap = await getDocs(cg);
            if (!cgSnap.empty) {
                const docSnap = cgSnap.docs[0];
                return this._resolveSeminarLayout({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (err) {
            console.warn("CollectionGroup query failed:", err);
        }
        return null;
    }

    // Helper to resolve hall layout if needed
    async _resolveSeminarLayout(seminar) {
        if (seminar.hallId) {
            // Fetch Hall
            try {
                const hallRef = doc(db, "colleges", seminar.collegeId, "halls", seminar.hallId);
                const hallSnap = await getDoc(hallRef);
                
                if (hallSnap.exists()) {
                    const hallData = hallSnap.data();
                    // Convert Firestore Hall Rows [{rowLabel: 'A', seats: 10}] to App rowConfig {1: 10}
                    const rowConfig = {};
                    let maxCol = 0;
                    let maxRow = 0;

                    if (hallData.rows && Array.isArray(hallData.rows)) {
                        hallData.rows.forEach(r => {
                            const rowIdx = getRowIndex(r.rowLabel);
                            rowConfig[rowIdx] = r.seats;
                            if (r.seats > maxCol) maxCol = r.seats;
                            if (rowIdx > maxRow) maxRow = rowIdx;
                        });
                    }

                    return {
                        ...seminar,
                        rowConfig,
                        rows: maxRow,
                        cols: maxCol,
                        totalSeats: hallData.totalSeats
                    };
                }
            } catch (e) {
                console.error("Failed to resolve hall for seminar", e);
            }
        }
        
        // Fallback or Custom Grid (seatingLayout stored in seminar)
        // Map seatingLayout (if exists) to rowConfig for App
        // The app uses rowConfig in SeatingGrid
        const rowConfig = seminar.seatingLayout || seminar.rowConfig || {};
        
        return {
            ...seminar,
            rowConfig
        };
    }

    async createSeminar(insertSeminar) {
        // insertSeminar: { collegeId, title, ..., rowConfig, hallId, ... }
        const seminarsRef = collection(db, "colleges", insertSeminar.collegeId, "seminars");
        
        const newSeminar = {
            collegeId: insertSeminar.collegeId,
            title: insertSeminar.title,
            description: insertSeminar.description,
            date: insertSeminar.date,
            time: insertSeminar.time,
            venue: insertSeminar.venue,
            slug: insertSeminar.slug,
            thumbnail: insertSeminar.thumbnail || "",
            createdAt: new Date().toISOString(),
            // Basic seats info (might be overwritten by hall logic on read)
            totalSeats: insertSeminar.totalSeats || 0,
            rows: insertSeminar.rows || 0,
            cols: insertSeminar.cols || 0
        };

        if (insertSeminar.hallId) {
            newSeminar.hallId = insertSeminar.hallId;
            // seatingLayout auto-derived, so we don't store it
            newSeminar.seatingLayout = null; 
        } else {
            // Custom Grid
            // Store rowConfig as seatingLayout
            newSeminar.seatingLayout = insertSeminar.rowConfig;
        }

        const docRef = await addDoc(seminarsRef, newSeminar);
        // Removed legacy mirroring to "seminars" collection to comply with strict isolation rules
        return { id: docRef.id, ...newSeminar };
    }

    async getCollegeStats(collegeId) {
        // Simple stats
        const seminars = await this.getSeminars(collegeId);
        return {
            totalSeminars: seminars.length,
            averageAttendance: 85,
            popularType: "Tech Workshop",
            suggestion: "Schedule seminars on Saturday mornings for higher turnout."
        };
    }

    // === HALLS ===
    async getHalls(collegeId) {
        const hallsRef = collection(db, "colleges", collegeId, "halls");
        const q = query(hallsRef, where("collegeId", "==", collegeId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Rows [{rowLabel: 'A', seats: 10}] to App Rows { "A": 10 }
            const rowsMap = {};
            if (data.rows && Array.isArray(data.rows)) {
                data.rows.forEach(r => {
                    rowsMap[r.rowLabel] = r.seats;
                });
            }
            return { id: doc.id, ...data, rows: rowsMap };
        });
    }

    async createHall(insertHall) {
        // insertHall: { collegeId, hallName, rows: { "A": 10, ... }, totalSeats }
        const hallsRef = collection(db, "colleges", insertHall.collegeId, "halls");
        
        // Convert App Rows { "A": 10 } to Firestore Rows [{rowLabel: 'A', seats: 10}]
        const firestoreRows = Object.entries(insertHall.rows || {}).map(([label, seats]) => ({
            rowLabel: label,
            seats: Number(seats)
        }));

        const newHall = {
            collegeId: insertHall.collegeId,
            hallName: insertHall.hallName, // Prompt says 'name', App uses 'hallName'. I'll use 'hallName' to match app usage, or map it.
            // Wait, Prompt Data Model says: "name".
            // App uses "hallName".
            // I should stick to Prompt Data Model "name" for Firestore, but map it for App.
            name: insertHall.hallName, 
            rows: firestoreRows,
            totalSeats: insertHall.totalSeats,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(hallsRef, newHall);
        
        // Return in App format
        return { 
            id: docRef.id, 
            ...insertHall 
        };
    }

    // === REGISTRATIONS ===
    async createRegistration(input) {
        // input: { seminarId, seatRow, seatCol, studentName, ... }
        // NEW PATH: colleges/{collegeId}/seminars/{seminarId}/registrations
        const regsRef = collection(db, "colleges", input.collegeId, "seminars", input.seminarId, "registrations");
        
        // Generate seatId "A-5"
        const rowLabel = getRowLabel(input.seatRow);
        const seatId = `${rowLabel}-${input.seatCol}`;

        // Check for existing seat
        // Query registrations where seatId == Y (in this seminar's subcollection)
        const q = query(
            regsRef, 
            where("seatId", "==", seatId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            throw new Error("Seat already taken");
        }

        const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();

        const newReg = {
            collegeId: input.collegeId,
            seminarId: input.seminarId,
            seatId: seatId,
            studentName: input.studentName,
            name: input.studentName,
            email: input.email,
            phone: input.phone,
            collegeName: input.collegeName || "",
            college: input.collegeName || "",
            course: input.course || "",
            semester: input.semester || "",
            attended: false,
            qrCodeData: uniqueId,
            ticketId: uniqueId,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(regsRef, newReg);
        
        // Return in App format (including seatRow/Col)
        return { 
            id: docRef.id, 
            uniqueId,
            ...newReg,
            seatRow: input.seatRow,
            seatCol: input.seatCol
        };
    }

    async getRegistrations(collegeId, seminarId) {
        // NEW PATH: colleges/{collegeId}/seminars/{seminarId}/registrations
        const regsRef = collection(db, "colleges", collegeId, "seminars", seminarId, "registrations");
        // No need to filter by seminarId as we are IN the seminar's subcollection
        // But we might want to order by createdAt?
        const q = query(regsRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            // Parse seatId "A-5" back to seatRow, seatCol
            let seatRow = 0;
            let seatCol = 0;
            if (data.seatId) {
                const parts = data.seatId.split('-');
                if (parts.length === 2) {
                    seatRow = getRowIndex(parts[0]);
                    seatCol = parseInt(parts[1]);
                }
            }

            return { 
                id: doc.id, 
                uniqueId: data.qrCodeData, // Map back
                ...data,
                seatRow,
                seatCol
            };
        });
    }

    async updateRegistrationAttendance(req) {
        const { collegeId, seminarId, registrationId, attended } = req;
        if (!collegeId || !seminarId || !registrationId) {
            throw new Error("Missing registration context");
        }

        const regRef = doc(db, "colleges", collegeId, "seminars", seminarId, "registrations", registrationId);
        await updateDoc(regRef, { attended });

        const snap = await getDoc(regRef);
        if (!snap.exists()) {
            return null;
        }

        const data = snap.data();
        let seatRow = 0;
        let seatCol = 0;
        if (data.seatId) {
            const parts = data.seatId.split("-");
            if (parts.length === 2) {
                seatRow = getRowIndex(parts[0]);
                seatCol = parseInt(parts[1]);
            }
        }

        return {
            id: snap.id,
            uniqueId: data.qrCodeData,
            ...data,
            seatRow,
            seatCol
        };
    }

    async verifyAttendance(req) {
        if (!req.collegeId) {
            throw new Error("College context is required");
        }

        let docSnap = null;

        if (req.seminarId) {
            const regsRef = collection(db, "colleges", req.collegeId, "seminars", req.seminarId, "registrations");
            const q = query(regsRef, where("qrCodeData", "==", req.uniqueId), limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                docSnap = snapshot.docs[0];
            }
        } else {
            const seminars = await this.getSeminars(req.collegeId);

            for (const seminar of seminars) {
                const regsRef = collection(db, "colleges", req.collegeId, "seminars", seminar.id, "registrations");
                const q = query(regsRef, where("qrCodeData", "==", req.uniqueId), limit(1));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    docSnap = snapshot.docs[0];
                    break;
                }
            }
        }

        if (!docSnap) {
            return { valid: false, message: "Invalid Ticket ID" };
        }

        const data = docSnap.data();
        if (data.attended) {
            return { valid: false, message: "Ticket Already Used", registration: data };
        }

        await updateDoc(docSnap.ref, {
            attended: true
        });

        return { valid: true, message: "Attendance Verified", registration: { ...data, attended: true } };
    }
}

export const localDB = new LocalDB();
// Seed only if explicitly called or needed for dev (Disabled for live production to rely on Firestore data)
// localDB.seed();

