import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDB } from "@/lib/local-db";
export function useRegistrations(collegeId, seminarId) {
    return useQuery({
        queryKey: ["registrations", collegeId, seminarId],
        enabled: !!collegeId && !!seminarId,
        queryFn: async () => {
            return await localDB.getRegistrations(collegeId, seminarId);
        },
    });
}
export function useCreateRegistration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            return await localDB.createRegistration(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["registrations", variables.collegeId, variables.seminarId]
            });
            queryClient.invalidateQueries({
                queryKey: ["seminar", variables.collegeId, variables.seminarId]
            });
        },
    });
}
export function useVerifyTicket() {
    return useMutation({
        mutationFn: async (payload) => {
            return await localDB.verifyAttendance(payload);
        },
    });
}

export function useToggleAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            return await localDB.updateRegistrationAttendance(payload);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["registrations", variables.collegeId, variables.seminarId]
            });
            queryClient.invalidateQueries({
                queryKey: ["seminar", variables.collegeId, variables.seminarId]
            });
        },
    });
}
