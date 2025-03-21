import { contactsApi, contacts as importedContacts } from "./data";
import axios from "axios";

const initialContacts =
  importedContacts.length > 0
    ? importedContacts
    : [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          company: "Example Corp",
          title: "CEO",
          status: "Active",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          company: "Tech Solutions",
          title: "Developer",
          status: "Inactive",
        },
      ];

const safeJSONParse = (str) => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : initialContacts;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return initialContacts;
  }
};

const getLocalStorageSize = () => {
  let totalSize = 0;
  for (let key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      totalSize += (localStorage[key].length * 2) / 1024 / 1024;
    }
  }
  return totalSize.toFixed(2);
};

const optimizeImageSize = (base64String) => {
  if (!base64String || !base64String.startsWith("data:image/")) {
    return base64String;
  }

  const estimatedSize = (base64String.length * 0.75) / (1024 * 1024);
  console.log(
    `Original image size (estimated): ${estimatedSize.toFixed(2)} MB`
  );

  if (estimatedSize < 1) {
    console.log("Image already optimized - size < 1MB");
    return base64String;
  }

  try {
    let quality = 0.7;

    if (estimatedSize > 3) {
      quality = 0.5;
    } else if (estimatedSize > 2) {
      quality = 0.6;
    }

    console.log(`Optimizing image with quality factor: ${quality}`);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > 1200 || height > 1200) {
          if (width > height) {
            height = Math.round(height * (1200 / width));
            width = 1200;
          } else {
            width = Math.round(width * (1200 / height));
            height = 1200;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const optimized = canvas.toDataURL("image/jpeg", quality);
        console.log(
          `Optimized image size: ${(
            (optimized.length * 0.75) /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );

        resolve(optimized);
      };
      img.src = base64String;
    }).catch((error) => {
      console.error("Error optimizing image:", error);
      return base64String;
    });
  } catch (error) {
    console.error("Error in image optimization:", error);
    return base64String;
  }
};

const apiClient = axios.create({
  baseURL: contactsApi,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message || "Unknown error");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

const API = {
  getContacts: async () => {
    const localContacts = localStorage.getItem("contacts");

    if (localContacts) {
      console.log("Using contacts from localStorage");
      const parsedContacts = safeJSONParse(localContacts);
      console.log("Parsed contacts:", parsedContacts.length, "items");
      return parsedContacts;
    }

    try {
      console.log(
        "No localStorage data. Fetching contacts from API:",
        contactsApi
      );
      const response = await apiClient.get("");
      console.log("Received data from API:", response.data);

      if (Array.isArray(response.data)) {
        localStorage.setItem("contacts", JSON.stringify(response.data));
        return response.data;
      } else {
        console.error("API did not return an array:", response.data);
        return initialContacts;
      }
    } catch (error) {
      console.error("Error fetching contacts from API:", error);
      console.log("Using initial contacts");
      return initialContacts;
    }
  },

  saveContact: async (newContact) => {
    try {
      console.log("Saving contact to API:", newContact);

      let optimizedAvatar = newContact.avatar;
      if (newContact.avatar && newContact.avatar.startsWith("data:image/")) {
        try {
          console.log("Optimizing avatar image before saving...");
          optimizedAvatar = await optimizeImageSize(newContact.avatar);
        } catch (optimizeError) {
          console.error("Error optimizing avatar:", optimizeError);
        }
      }

      const contactToSave = {
        ...newContact,
        name: newContact.name || "",
        email: newContact.email || "",
        company: newContact.company || "",
        title: newContact.title || "",
        status: newContact.status || "Active",
        avatar: optimizedAvatar || "",
        fileName: newContact.fileName || "",
      };

      console.log("Prepared contact for API:", contactToSave);
      console.log("API endpoint:", contactsApi);

      try {
        const response = await apiClient.post("", contactToSave);
        console.log("API response status:", response.status);
        console.log("Saved contact from API:", response.data);

        try {
          let currentContacts = localStorage.getItem("contacts");
          if (currentContacts) {
            currentContacts = safeJSONParse(currentContacts);
            currentContacts.push(response.data);
            localStorage.setItem("contacts", JSON.stringify(currentContacts));
          } else {
            localStorage.setItem("contacts", JSON.stringify([response.data]));
          }

          console.log(
            "Contact saved to API and localStorage, dispatching event"
          );
          window.dispatchEvent(new Event("storageUpdate"));
        } catch (storageError) {
          console.error("Error updating localStorage:", storageError);
        }

        return response.data;
      } catch (apiError) {
        console.error("API call failed, using fallback:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Error saving contact to API:", error);

      const fallbackContact = {
        ...newContact,
        id: newContact.id || Date.now().toString(),
      };
      console.log("Using fallback contact:", fallbackContact);

      try {
        let currentContacts = localStorage.getItem("contacts");
        currentContacts = currentContacts ? safeJSONParse(currentContacts) : [];

        console.log("Current contacts before push:", currentContacts.length);
        currentContacts.push(fallbackContact);
        console.log("Current contacts after push:", currentContacts.length);

        localStorage.setItem("contacts", JSON.stringify(currentContacts));

        console.log("Contact saved to localStorage, dispatching event");
        window.dispatchEvent(new Event("storageUpdate"));
      } catch (storageError) {
        console.error("Error updating localStorage:", storageError);
      }

      return fallbackContact;
    }
  },

  updateContact: async (updatedContact) => {
    try {
      console.log("Updating contact with ID:", updatedContact.id);

      let optimizedContact = { ...updatedContact };
      if (
        updatedContact.avatar &&
        updatedContact.avatar.startsWith("data:image/")
      ) {
        try {
          console.log("Optimizing avatar image before updating...");
          optimizedContact.avatar = await optimizeImageSize(
            updatedContact.avatar
          );
        } catch (optimizeError) {
          console.error("Error optimizing avatar:", optimizeError);
        }
      }

      const response = await apiClient.put(
        `/${updatedContact.id}`,
        optimizedContact
      );

      console.log("Update successful, received:", response.data);

      try {
        const localContacts = localStorage.getItem("contacts");
        if (localContacts) {
          let contacts = safeJSONParse(localContacts);
          contacts = contacts.map((contact) =>
            contact.id === updatedContact.id ? response.data : contact
          );
          localStorage.setItem("contacts", JSON.stringify(contacts));
        }
      } catch (storageError) {
        console.error("Error updating localStorage:", storageError);
      }

      return response.data;
    } catch (error) {
      console.error("Error updating contact:", error);

      if (error.response && error.response.status === 404) {
        console.error("Contact not found. Contact ID:", updatedContact.id);
      }

      console.log("API error. Using local update fallback");

      try {
        let currentContacts = localStorage.getItem("contacts");
        if (currentContacts) {
          currentContacts = safeJSONParse(currentContacts);

          const updatedContacts = currentContacts.map((contact) =>
            contact.id === updatedContact.id ? updatedContact : contact
          );

          localStorage.setItem("contacts", JSON.stringify(updatedContacts));

          setTimeout(() => {
            window.dispatchEvent(new Event("storageUpdate"));
          }, 300);

          return updatedContact;
        }
      } catch (fallbackError) {
        console.error("Fallback update also failed:", fallbackError);
      }

      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      console.log("Deleting contact with ID:", id);

      await apiClient.delete(`/${id}`);

      console.log("Contact deleted successfully, fetching updated list");

      const updatedResponse = await apiClient.get("");

      return updatedResponse.data;
    } catch (error) {
      console.error("Error deleting contact:", error);

      console.log("API error. Using local delete fallback");

      try {
        let currentContacts = localStorage.getItem("contacts");
        if (currentContacts) {
          currentContacts = safeJSONParse(currentContacts);
        } else {
          currentContacts = [...initialContacts];
        }

        const updatedContacts = currentContacts.filter(
          (contact) => contact.id !== id
        );

        localStorage.setItem("contacts", JSON.stringify(updatedContacts));

        setTimeout(() => {
          window.dispatchEvent(new Event("storageUpdate"));
        }, 300);

        return updatedContacts;
      } catch (fallbackError) {
        console.error("Fallback deletion also failed:", fallbackError);
        throw error;
      }
    }
  },

  getStorageInfo: () => {
    const size = getLocalStorageSize();
    const maxSize = 5;
    return {
      size,
      maxSize,
      percentUsed: (size / maxSize) * 100,
    };
  },

  debug: {
    logStorageInfo: () => {
      const storageInfo = API.getStorageInfo();
      console.log("=== LocalStorage Debug Information ===");
      console.log(`Current size: ${storageInfo.size} MB`);
      console.log(`Max size (approx): ${storageInfo.maxSize} MB`);
      console.log(`Percent used: ${storageInfo.percentUsed.toFixed(2)}%`);
      return storageInfo;
    },
  },
};

export default API;
