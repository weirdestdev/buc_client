import { $authHost } from "./index";

export const getAllUsersCount = async (): Promise<number> => {
    const { data } = await $authHost.get('api/user-work/count');
    return data.count;
};

export const getPendingUsersCount = async (): Promise<number> => {
    const { data } = await $authHost.get('api/user-work/count/pending');
    return data.count;
};

export const getApprovedUsersCount = async (): Promise<number> => {
    const { data } = await $authHost.get('api/user-work/count/approved');
    return data.count;
};

export const getBlockedUsersCount = async (): Promise<number> => {
    const { data } = await $authHost.get('api/user-work/count/blocked');
    return data.count;
};

export const getUsersWithPagination = async (
    page: number,
    limit: number,
    searchQuery: string = '',
    category: string = ''
) => {
    const { data } = await $authHost.get('api/user-work', {
        params: {
            page,
            limit,
            searchQuery, // параметр поиска
            category,    // параметр фильтрации по статусу (pending, approved, blocked)
        }
    });
    return data;
};


// Одобрить пользователя (сменить статус на approved)
export const approveUser = async (id: number): Promise<void> => {
    await $authHost.patch(`api/user-work/${id}/approve`);
};

// Заблокировать пользователя (сменить статус на blocked)
export const blockUser = async (id: number): Promise<void> => {
    await $authHost.patch(`api/user-work/${id}/block`);
};

// Разблокировать пользователя (если он в статусе blocked, сменить на approved)
export const unblockUser = async (id: number): Promise<void> => {
    await $authHost.patch(`api/user-work/${id}/unblock`);
};