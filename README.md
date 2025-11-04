# 🚨 SafeLink: Emergency & Family Safety App

**SafeLink** is a robust, feature-rich **React Native / Expo** application designed to connect communities and families during emergencies. It enables quick status broadcasts, disaster alerts, and access to vital information like evacuation centers, powered by **Firebase** for backend services and utilizing **OpenStreetMap (Overpass)** for geographical data.

---

## ✨ Key Features & Functionality

SafeLink is engineered for resilience and real-time communication.

### 🛡️ User & Authentication
* **User Management:** Seamless **Firebase** integration for authentication and secure profile management.
* **Admin Tools:** Dedicated **Admin Panel** with granular permissions (verification, broadcast, admin roles).

### 💬 Status & Communication
* **Quick Status Updates:** Users can broadcast their status instantly (**Safe, Needs Help,** etc.) with real-time family notifications.
* **AutoStatusService:** Intelligent service for automatic status detection and timers (**Not Yet Responded, Unknown**).

### 🔔 Notifications & Alerts
* **Advanced Notification System:** Configurable settings, push token registration, and **disaster proximity alerts**.
* **Targeted Broadcasts:** Emergency alerts can be sent and received, specifically targeted by geographic area.

### 🗺️ Evacuation & Location Services
* **Evacuation Centers:** Detailed listing, map view, routing, and **Google Maps integration** (with app/web fallbacks).
* **OverpassService:** Fetches live, nearby evacuation centers from **OpenStreetMap**, backed by a static data fallback for reliability.
* **Location Support:** Comprehensive location services, including **background and emergency location tracking** with integrated debugging tools.

### 🔨 Development & Resilience
* **Resilient UX:** Built with **ErrorBoundary** and various crash / null-safety fixes for a stable user experience.
* **Dev Utilities:** Includes development guides and utilities for building **dev clients with push notifications** (EAS, expo-notifications).

---

## 💻 Quick Start (Development)

Ready to explore the code? Get SafeLink running in minutes.

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/kidlatpogi/SafeLink.git](https://github.com/kidlatpogi/SafeLink.git)
    ```
2.  **Install Dependencies:**
    ```bash
    cd SafeLink
    npm install
    npm start
    ```
3.  **Detailed Setup:**
    * **IMPORTANT:** For push notifications, follow the detailed instructions in **`DEVELOPMENT_GUIDE.md`** for Expo vs. Dev Build specifics, push-notification setup (EAS, expo-notifications, expo-device), Android keystore, and other environment steps.

---

## 📜 License: Educational Use Only (EUO) 2025

| Category | Policy |
| :--- | :--- |
| **Copyright** | (c) 2025 **kidlatpogi** |
| **Allowed Uses** | Non-commercial, **educational, research, teaching,** demonstration, and personal learning. |
| **Prohibited Uses** | **Strictly NO commercial use** (sale, sublicense, distribution for a fee, incorporation into a commercial product/service). |
| **Attribution** | **Required** on all copies or substantial portions of the Software. |

**Disclaimer:** THE SOFTWARE IS PROVIDED **"AS IS," WITHOUT WARRANTY** OF ANY KIND. The author is **NOT LIABLE** for any claims or damages.

> **Commercial Inquiry:** If you require a commercial license or wish to use the Software in a product or service that will be sold, please contact the copyright holder at **github.com/kidlatpogi** to discuss licensing arrangements.
