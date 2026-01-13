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
            const seminar = await localDB.getSeminar(id);
            if (!seminar)
                throw new Error("Seminar not found");
            const registrations = await localDB.getRegistrations(collegeId, id);
            return { ...seminar, registrations };
        },
        enabled: !!collegeId && !!id,
    });
}
export function useSeminarBySlug(slug) {
    return useQuery({
        queryKey: ["seminar-slug", slug],
        queryFn: async () => {
            const seminar = await localDB.getSeminarBySlug(slug);
            if (!seminar)
                throw new Error("Seminar not found");
            const registrations = await localDB.getRegistrations(seminar.collegeId, seminar.id);
            return { ...seminar, registrations };
        },
        enabled: !!slug,
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
