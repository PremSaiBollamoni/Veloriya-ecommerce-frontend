# 🛍️ Veloriya E-commerce

<div align="center">

![Veloriya E-commerce](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=300&section=header&text=Veloriya%20E-commerce&fontSize=90&animation=fadeIn&fontAlignY=38&desc=Modern%20Full-Stack%20Shopping%20Experience&descAlignY=55&descAlign=50)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

</div>

---

## 📖 About The Project

**Veloriya E-commerce** is a cutting-edge, full-stack e-commerce platform designed to provide a seamless and engaging shopping experience. Built with the latest web technologies, it features a highly responsive design, smooth animations, and a robust backend management system.

Whether you're browsing the latest gadgets, managing your wishlist, or tracking your orders, Veloriya offers a fast, secure, and intuitive interface.

---

## ✨ Key Features

### 🎨 Frontend Experience
*   **Modern UI/UX:** Clean, minimalist design powered by **Tailwind CSS**.
*   **Smooth Animations:** Engaging page transitions and micro-interactions using **Framer Motion**.
*   **Responsive Design:** Fully optimized for mobile, tablet, and desktop devices.
*   **Smart Search:** Real-time product search and filtering capabilities.
*   **User Dashboard:** Manage profile, addresses, and view order history.
*   **Shopping Cart & Wishlist:** Seamlessly add products and manage your potential purchases.
*   **Secure Checkout:** Integrated payment flow options (Card, UPI, EMI, Wallet).

### ⚙️ Backend Power
*   **Robust API:** RESTful API built with **Node.js** and **Express**.
*   **Secure Authentication:** JWT-based user authentication and authorization.
*   **Database Management:** Efficient data modeling with **MongoDB** and **Mongoose**.
*   **Admin Dashboard:** Comprehensive tools for managing products, orders, and users.
*   **Real-time Updates:** Socket.io integration for real-time features.

---

## 🛠️ Tech Stack

<details>
  <summary><b>Frontend</b></summary>
  
  *   **Framework:** [React](https://reactjs.org/)
  *   **Build Tool:** [Vite](https://vitejs.dev/)
  *   **Language:** [TypeScript](https://www.typescriptlang.org/)
  *   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  *   **Icons:** [Lucide React](https://lucide.dev/)
  *   **Animations:** [Framer Motion](https://www.framer.com/motion/)
  *   **State Management:** React Context API
  *   **HTTP Client:** [Axios](https://axios-http.com/)
</details>

<details>
  <summary><b>Backend</b></summary>
  
  *   **Runtime:** [Node.js](https://nodejs.org/)
  *   **Framework:** [Express.js](https://expressjs.com/)
  *   **Database:** [MongoDB](https://www.mongodb.com/)
  *   **ODM:** [Mongoose](https://mongoosejs.com/)
  *   **Authentication:** [JSON Web Token (JWT)](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
  *   **Real-time:** [Socket.io](https://socket.io/)
</details>

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js** (v14 or higher)
*   **MongoDB** (Local or Atlas connection string)

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/yourusername/veloriya-ecommerce.git
    cd veloriya-ecommerce
    ```

2.  **Install Frontend Dependencies**
    ```sh
    npm install
    ```

3.  **Install Backend Dependencies**
    ```sh
    cd backend
    npm install
    ```

### Configuration

1.  **Backend Environment Variables**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLIENT_URL=http://localhost:5173
    ```

2.  **Frontend Configuration**
    Ensure `src/config.ts` points to your local backend (default is usually set correctly).

### Running the Application

1.  **Start the Backend Server**
    ```sh
    cd backend
    npm run dev
    ```
    *The server will start on `http://localhost:5000`*

2.  **Seed the Database (Optional)**
    Populate your database with initial products and categories:
    ```sh
    npm run seed
    ```

3.  **Start the Frontend Development Server**
    Open a new terminal in the root directory:
    ```sh
    npm run dev
    ```
    *The application will open at `http://localhost:5173`*

---

## 📸 Screenshots

<div align="center">
  <!-- Replace these with actual screenshots of your application -->
  <img src="https://via.placeholder.com/800x450?text=Home+Page" alt="Home Page" width="800"/>
  <br/><br/>
  <img src="https://via.placeholder.com/800x450?text=Product+Details" alt="Product Details" width="800"/>
  <br/><br/>
  <img src="https://via.placeholder.com/800x450?text=Checkout+Process" alt="Checkout" width="800"/>
</div>

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ by the Veloriya Team</p>
</div>
