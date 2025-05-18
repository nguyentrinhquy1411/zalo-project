import { API } from "../../config/axios";

export const getConversationList = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.get(`/conversations/getList`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation list:", error);
    throw error;
  }
};

export const getConversationById = async (conversationId) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.get(`/conversations/${conversationId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching conversation by ID:", error);
    throw error;
  }
};

export const addMembersToGrou = async (conversationId, newMemberIds) => {
  try {
    const response = await API.post(
      `/conversations/add-members`,
      { conversationId, newMemberIds },
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
    throw new Error("Không thể thêm thành viên vào nhóm");
  }
};

export const createGroup = async (formData) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.post(`/conversations/createGroup`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

export const addMembersToGroup = async (conversationId, newMemberIds) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.post(
      `/conversations/add-members`,
      { conversationId, newMemberIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Không thể thêm thành viên vào nhóm");
  }
};

export const leaveGroup = async (conversationId, newLeader) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.post(
      `/conversations/leave-group`,
      { conversationId, newLeader },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Không thể rời nhóm");
  }
};

export const deleteGroup = async (conversationId) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.delete(
      `/conversations/delete-group/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Không thể xóa nhóm");
  }
};

export const removeMemberFromGroup = async (conversationId, memberId) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.delete(
      `/conversations/${conversationId}/remove-member/${memberId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error removing member:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Không thể xóa thành viên khỏi nhóm");
  }
};
