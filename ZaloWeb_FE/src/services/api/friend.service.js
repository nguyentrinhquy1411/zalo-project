import { API } from "../../config/axios";

const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const friendService = {
  // Gửi yêu cầu kết bạn
  sendRequest: async (phoneNumber) => {
    try {
      const response = await API.post(
        `/friend/request`,
        { phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể gửi yêu cầu kết bạn");
    }
  },

  getFriendStatus: async (userId) => {
    try {
      const response = await API.get(`/friend/status/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể kiểm tra trạng thái bạn bè");
    }
  },

  acceptRequest: async (requestId) => {
    try {
      const response = await API.post(
        `/friend/accept`,
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể chấp nhận yêu cầu kết bạn");
    }
  },

  getFriends: async () => {
    try {
      const response = await API.get(`/friend/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể lấy danh sách bạn bè");
    }
  },
  // Lấy danh sách lời mời kết bạn
  getFriendRequests: async (userId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const userIdToUse = userId || userData?._id;

      if (!userIdToUse) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const response = await API.get(`/friend/requests/${userIdToUse}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      // Handle 404 (no friend requests) gracefully
      if (error.response && error.response.status === 404) {
        return { data: { totalRequests: 0, requests: [] } };
      }
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể lấy danh sách lời mời kết bạn");
    }
  },

  // Từ chối lời mời kết bạn
  rejectRequest: async (requestId) => {
    try {
      const response = await API.post(
        `/friend/reject`,
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể từ chối lời mời kết bạn");
    }
  },
};
