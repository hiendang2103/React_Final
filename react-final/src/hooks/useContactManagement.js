import { useState, useEffect, useCallback } from "react";
import API from "../api/api";

export const useContactManagement = (initialContacts = []) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showAlert = (msg, type = "success") => {
    setAlertState({
      visible: true,
      message: msg,
      type,
    });

    setTimeout(() => {
      setAlertState((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching contacts from API...");
      const data = await API.getContacts();
      console.log("Contacts fetched:", data);
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        console.error("API did not return an array:", data);
        showAlert("Received invalid data format from API", "error");
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      showAlert("Failed to load contacts: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();

    const handleStorageUpdate = () => {
      console.log("Storage updated, reloading contacts");
      fetchContacts();
    };

    window.addEventListener("storageUpdate", handleStorageUpdate);
    return () => {
      window.removeEventListener("storageUpdate", handleStorageUpdate);
    };
  }, [fetchContacts]);

  const addContact = async (newContact) => {
    try {
      const isDuplicate = contacts.some(
        (contact) => contact.email === newContact.email
      );

      if (isDuplicate) {
        showAlert("A contact with this email already exists", "error");
        return null;
      }

      console.log("Attempting to save contact:", newContact);

      const contactToAdd = {
        ...newContact,
        id: Date.now().toString(),
      };

      setContacts((prevContacts) => [...prevContacts, contactToAdd]);

      try {
        const savedContact = await API.saveContact(contactToAdd);
        console.log("Contact saved to API successfully:", savedContact);

        showAlert("Contact added successfully!", "success");

        return savedContact;
      } catch (apiError) {
        console.error("API save failed:", apiError);

        showAlert("Contact saved locally (API unavailable)", "warning");

        return contactToAdd;
      }
    } catch (error) {
      console.error("Failed to add contact:", error);
      showAlert("Failed to add contact: " + error.message, "error");
      throw error;
    }
  };
  const updateContact = async (updatedContact) => {
    try {
      console.log("Updating contact with API:", updatedContact);
      const result = await API.updateContact(updatedContact);

      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === updatedContact.id ? result : contact
        )
      );

      showAlert("Contact updated successfully!", "success");
      return result;
    } catch (error) {
      console.error("Failed to update contact with API:", error);
      showAlert("API error: Using local update instead", "warning");

      console.log("Using local fallback for update");
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact
        )
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storageUpdate"));
      }, 300);

      return updatedContact;
    }
  };

  const deleteContact = async (id) => {
    try {
      const updatedContacts = await API.deleteContact(id);
      setContacts(updatedContacts);
      showAlert("Contact deleted successfully!", "success");
      return updatedContacts;
    } catch (error) {
      console.error("Failed to delete contact:", error);
      showAlert("Failed to delete contact", "error");
      throw error;
    }
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };
  return {
    contacts,
    setContacts,
    loading,
    alertState,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    showAlert,
    hideAlert,
  };
};
