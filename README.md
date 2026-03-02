# Al-Tahera Medical Center Feedback App 🏥

A modern, responsive, multi-step web application designed to collect patient feedback for Al-Tahera Medical Center. The application features an interactive UI with 3D emojis and seamlessly integrates with Google Sheets to store feedback data.

## 🌟 Key Features

- **Multi-step Feedback Wizard**: A smooth, guided user experience divided into logical steps.
- **Barcode Scanner**: Integrated camera barcode scanner (`html5-qrcode`) to effortlessly capture the patient's ID/Barcode directly from their medical papers.
- **3D Emoji Ratings**: Replaced traditional star ratings with highly engaging 3D emojis from Google Noto Emoji.
- **Fully Responsive**: Adapts perfectly to mobile phones, tablets, and desktop screens with a fluid UI.
- **Modern UI/UX**: Built with custom CSS featuring glassmorphism, smooth animations, and the professional Tajawal Google Font.
- **Google Sheets Integration**: Automatically sends feedback data to a linked Google Sheet via a Google Apps Script Web App without requiring a backend database.

## 📝 Sections Evaluated

The form collects feedback on the following categories:
1. Patient Data (Barcode & Optional Name)
2. Reception Staff (`ReceptionRating`)
3. Nursing Staff (`NursingRating`)
4. Doctors (`DoctorsRating`)
5. Medical Equipment Quality (`EquipmentRating`)
6. Cleaning Staff (`CleaningRating`)
7. Result Handover Process (`HandoverRating`)
8. Additional Comments

## 🚀 Setup & Installation

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/tahrascan1188-ai/altahera-feedback.git
   ```
2. Open `index.html` in any modern web browser or use a local development server (e.g., Live Server in VS Code).

### Google Sheets Integration Setup
To connect this form to your own Google Sheet:
1. Create a new Google Sheet.
2. Add the following column headers in the **first row (Row 1)** exactly as written:
   `Date`, `PatientName`, `PatientBarcode`, `ReceptionRating`, `NursingRating`, `DoctorsRating`, `EquipmentRating`, `CleaningRating`, `HandoverRating`, `Comments`
3. Go to **Extensions > Apps Script**.
4. Paste the provided Google Apps Script code (which handles the POST request) into the editor.
5. Click **Deploy > New deployment**, select **Web app**, set access to **Anyone**, and deploy.
6. Copy the generated Web App URL.
7. Open `script.js` in this repository and replace the `scriptURL` variable with your new URL.

## 🛠️ Technologies Used

- **HTML5**: Semantic structure and multi-step layout.
- **CSS3**: Custom styling, Flexbox, media queries, CSS variables, and keyframe animations.
- **Vanilla JavaScript (ES6)**: Form validation, step navigation, barcode scanner initialization, and Fetch API for data submission.
- **HTML5-QRCode**: Library for scanning barcodes via the device camera.
- **Google Apps Script**: Serverless backend to receive form data and append it to Google Sheets.

## 👨‍💻 Developed By
**IT & Digital Transformation Department**
Al-Tahera Medical Center for Radiology and Medical Analysis
