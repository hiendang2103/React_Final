export const validateContact = (contact) => {
  const errors = {};

  if (!contact.name || contact.name.trim() === "") {
    errors.name = "Tên không được để trống";
  }

  if (!contact.email) {
    errors.email = "Email không được để trống";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.email = "Email không hợp lệ";
    }
  }

  if (!contact.company || contact.company.trim() === "") {
    errors.company = "Công ty không được để trống";
  }

  if (!contact.title || contact.title.trim() === "") {
    errors.title = "Chức danh không được để trống";
  }

  if (!contact.status) {
    errors.status = "Trạng thái không được để trống";
  }

  if (contact.phone) {
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(contact.phone.replace(/\s+/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isDuplicateEmail = (contacts, email, currentId = null) => {
  return contacts.some(
    (contact) =>
      contact.email.toLowerCase() === email.toLowerCase() &&
      contact.id !== currentId
  );
};

export const validateImageFile = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    return {
      isValid: false,
      message: "Chỉ chấp nhận file JPG/PNG!",
    };
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    return {
      isValid: false,
      message: "Kích thước ảnh phải nhỏ hơn 2MB!",
    };
  }

  return {
    isValid: true,
    message: "File hợp lệ",
  };
};
