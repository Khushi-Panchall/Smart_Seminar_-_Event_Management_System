import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDB } from "@/lib/local-db";
export function useSeminars(collegeId) {
    return useQuery({
        queryKey: ["seminars", collegeId],
        enabled: !!collegeId,
        queryFn: async () => {
            return await localDB.getSeminars(collegeId);
        },
    });
}
export function useSeminar(collegeId, id) {
    return useQuery({
        queryKey: ["seminar", collegeId, id],
        queryFn: async () => {
            const seminar = await localDB.getSeminar(collegeId, id);
            if (!seminar)
                throw new Error("Seminar not found");
            const registrations = await localDB.getRegistrations(collegeId, id);
            return { ...seminar, registrations };
        },
        enabled: !!collegeId && !!id,
    });
}

export function useSeminarByCollegeAndSlug(collegeSlug, slug) {
    return useQuery({
        queryKey: ["seminar-slug", collegeSlug, slug],
        queryFn: async () => {
            try {
                const seminar = await localDB.getSeminarByCollegeAndSlug(collegeSlug, slug);
                if (!seminar)
                    return null;
                const registrations = await localDB.getRegistrations(seminar.collegeId, seminar.id);
                return { ...seminar, registrations };
            }
            catch (error) {
                console.error("Failed to load seminar by slug", { collegeSlug, slug, error });
                return null;
            }
        },
        enabled: !!collegeSlug && !!slug,
    });
}

// Deprecated: Kept for temporary backward compatibility during migration
export function useSeminarBySlug(slug) {
     return useQuery({
        queryKey: ["seminar-slug-legacy", slug],
        queryFn: async () => {
             // We can't support this reliably with strict isolation without collegeSlug
             return null; 
        },
        enabled: false
    });
}
export function useCreateSeminar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            return await localDB.createSeminar(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["seminars", variables.collegeId]
            });
        },
    });
}
