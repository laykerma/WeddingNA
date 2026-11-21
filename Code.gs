const SPREADSHEET_ID = "1aapVSw0-qTax7zdaSFh0s5tQdeb72fAgMxKIIoTShEc";
const SHEET_NAME = "RSVP";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Missing request body");
    }

    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== "object") {
      throw new Error("Invalid request body");
    }

    const name = String(data.name || "").trim();
    const phone = String(data.phone || "").trim();
    const attendees = Number(data.attendees);
    const attendance = String(data.attendance || "");
    const message = String(data.message || "").trim();

    if (
      !name ||
      name.length > 60 ||
      !phone ||
      phone.length > 20 ||
      !Number.isInteger(attendees) ||
      attendees < 1 ||
      attendees > 4 ||
      (attendance !== "yes" && attendance !== "no") ||
      !message ||
      message.length > 300
    ) {
      throw new Error("Invalid RSVP fields");
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời điểm gửi",
        "Tên khách mời",
        "Số điện thoại",
        "Số lượng khách",
        "Trạng thái tham dự",
        "Lời chúc"
      ]);
    }

    sheet.appendRow([
      new Date(),
      safeSheetText(name),
      safeSheetText(phone),
      attendees,
      attendance,
      safeSheetText(message)
    ]);

    return jsonOutput({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonOutput({ ok: false, error: "Không thể lưu RSVP." });
  }
}

function safeSheetText(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonOutput(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
