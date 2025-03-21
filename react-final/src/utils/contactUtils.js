export const getStatusColor = (status) => {
  const statusColors = {
    New: "blue",
    Won: "green",
    Lost: "orange",
    Churned: "red",
    Qualified: "cyan",
    Unqualified: "purple",
    Negotiation: "gold",
  };
  return statusColors[status] || "default";
};

export const statusOptions = [
  { value: "New", label: "New", color: "blue" },
  { value: "Won", label: "Won", color: "green" },
  { value: "Lost", label: "Lost", color: "orange" },
  { value: "Churned", label: "Churned", color: "red" },
  { value: "Qualified", label: "Qualified", color: "cyan" },
  { value: "Unqualified", label: "Unqualified", color: "purple" },
  { value: "Negotiation", label: "Negotiation", color: "gold" },
];

export const filterContacts = (contacts, searchTerm) => {
  if (!Array.isArray(contacts)) return [];

  return contacts.filter((contact) =>
    ["name", "email", "company"].some((key) =>
      contact[key]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};

export const paginateContacts = (contacts, currentPage, pageSize) => {
  if (!Array.isArray(contacts)) return [];

  return contacts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
};
