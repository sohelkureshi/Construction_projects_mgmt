
# **Construction Projects Management System**

A full-stack web application designed to efficiently manage construction projects, including progress tracking, billing, document storage, and team collaboration.

Live Demo :- https://construction-projects-mgmt.onrender.com/

---

## **Project Overview**

This application enables construction teams to manage multiple projects from a centralized platform.
Users can log in (selecting a role), create projects, assign tasks, upload documents (such as drawings or tenders), and track billing records.

The system supports **role-based access control**, allowing specific permissions for Managers, Engineers, Contractors, and Guests.

---

## **Features**

* Secure user authentication and role-based access
* Project creation and workflow management
* Progress and activity tracking
* Secure Cloudinary-based document uploads
* Billing workflow: created by **Manager** → approved/rejected by **Senior Manager**
* Server-rendered dynamic dashboards using EJS
* Team collaboration and project-restricted access

---

## **Technology Stack**

### **Backend**

* Node.js
* Express.js
* MongoDB (Mongoose)
* Cloudinary API
* dotenv

### **Frontend**

* EJS templating engine
* CSS (custom styling)
* Client-side JavaScript

---

## **Folder Structure**

```
Construction_projects_mgmt/
├─ cloudinary/            -> Cloudinary config and upload utilities
├─ middleware/            -> Authentication and role validation middleware
├─ model/                 -> Schemas: User, Project, Task, Billing
├─ public/                -> Static files (CSS, JS, images)
├─ routes/                -> Route handlers (auth, project, billing)
├─ views/                 -> UI templates (dashboard, login, forms)
├─ .gitignore
├─ LICENSE
├─ README.md
├─ app.js                 -> Application entry point
├─ package.json
├─ package-lock.json
├─ requirements.txt       -> Optional supporting dependency list
```

---

## **System Workflow (High Level)**

1. **Initialization:**
   `app.js` connects to MongoDB, loads environment variables, configures middleware, and initializes routing.

2. **Authentication:**
   Users register or log in, and permissions are assigned based on their role.

3. **Project Management:**
   Authorized users can create projects, define timelines, assign team members, and set budgets.

4. **Task Management:**
   Tasks are created under projects and updated by responsible users.

5. **Document Storage:**
   Documents uploaded via Cloudinary generate secure URLs stored in MongoDB.

6. **Billing:**
   Billing requests are created and then approved or rejected by a senior manager.

7. **Dashboard & Reports:**
   Users view measurable project progress, billing history, and workflow insights.

---

## **Setup & Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/sohelkureshi/Construction_projects_mgmt.git
cd Construction_projects_mgmt
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Configure Environment Variables**

Create a `.env` file and add:

```
PORT=3000
MONGO_URI=<your-mongodb-url>
SESSION_SECRET=<secure-session-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
```

### **4. Start the Application**

```bash
npm start
```

The server will run at:

```
http://localhost:3000
```

---

## **User Flow**

1. Register or log in (role selection required, admin approval optional)
2. Create or join a project
3. Upload project-related documents
4. Track progress and manage tasks
5. Add billing entries → await approval
6. Review dashboards and reports

---

## **Troubleshooting**

| Issue               | Cause                                      | Solution                                  |
| ------------------- | ------------------------------------------ | ----------------------------------------- |
| Server not starting | Missing `.env` or MongoDB connection issue | Verify environment variables              |
| Upload failure      | Incorrect Cloudinary credentials           | Update `.env` values                      |
| Access denied       | User role mismatch                         | Validate role configuration in middleware |

---

## **Contributing**

Contributions are welcome!

Steps to contribute:

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Submit a pull request with details

---

## **License**

This project is licensed under the **MIT License**.

---

## **Contact**

For issues, feedback, or suggestions, visit:

```
Email :- sohelkureshi138@gmail.com
https://github.com/sohelkureshi/Construction_projects_mgmt
```

---
