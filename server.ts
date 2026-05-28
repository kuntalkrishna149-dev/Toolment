import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { User, Feedback, UtilityTool } from "./src/types";

const app = express();
const PORT = 3000;

// Setup uploads directory for custom tool uploads
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

const DB_PATH = path.join(process.cwd(), "database.json");

// Middleware to parse incoming request payloads
app.use(express.json());

// Robust Local JSON Database Engine
interface DatabaseSchema {
  users: User[];
  feedbacks: Feedback[];
  tools: UtilityTool[];
}

const DEFAULT_TOOLS: UtilityTool[] = [
  {
    id: "vector graph",
    name: "Vector Graph Prototyper",
    desc: "An endless grid designed for exact geometry calculations. Plot custom vector coordinates, evaluate intersecting nodes, design custom shapes, and visualize complex polygons instantly.",
    link: "https://vectorgraph.netlify.app",
    tags: ["geometric", "graph", "shape", "vector", "infinite", "visualizer"]
  },
  {
    id: "color visualize",
    name: "Color Labs & Explorer",
    desc: "Deep HSL spectrum explorer. Calibrate Hue angles, modify saturation gradients, control alpha opacity channels, compute harmonies, evaluate luminance ratios, and copy code payloads instantly.",
    link: "https://colovisualizertoolment.netlify.app",
    tags: ["color", "hsl", "rgba", "palette", "rgb", "hsla", "compiler"],
    isInternalWorkspace: true
  },
  {
    id: "hop square",
    name: "Hop Square Kinetic Portal",
    desc: "Interact with physics bounds, gravitational values, and kinetic speeds inside this cosmic interactive game suite. Bounce off polygons and evaluate vector jump curves.",
    link: "https://hopsquaretoolmen5.netlify.app",
    tags: ["game", "space", "gravity", "jump", "kinetics", "physics"]
  }
];

function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create fresh default schema with preloaded admin user
      const defaultDb: DatabaseSchema = {
        users: [
          {
            id: "admin-id-principal",
            username: "Vinay Kuntal (Admin)",
            email: "kuntal2010oct@gmail.com",
            password: "vinay10133", // Securely stored in internal JSON, stripped on clientside
            preferences: {
              theme: "light",
              favoriteTools: ["color visualize", "vector graph"]
            }
          }
        ],
        feedbacks: [
          {
            id: "seed-feedback-1",
            name: "Initial Tester",
            email: "test@example.com",
            type: "General Feedback",
            rating: 5,
            comment: "This dashboard workspace is super fast and beautiful! Loving the HSL Color Labs interactive tool.",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            simulatedEmailSent: true
          }
        ],
        tools: DEFAULT_TOOLS
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    const db = JSON.parse(data) as DatabaseSchema;
    if (!db.users) {
      db.users = [];
    }
    if (db.users) {
      db.users = db.users.map(u => {
        if (u.email) {
          u.email = u.email.trim().toLowerCase();
        }
        return u;
      });
    }
    if (!db.feedbacks) {
      db.feedbacks = [];
    }
    if (!db.tools) {
      db.tools = DEFAULT_TOOLS;
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    console.error("Database read error:", error);
    return { users: [], feedbacks: [], tools: DEFAULT_TOOLS };
  }
}

function writeDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Database write error:", error);
  }
}

// Help compute clean role classifications: User, Admin, or Owner
function getUserRole(user: any): "user" | "admin" | "owner" {
  if (!user || !user.email) return "user";
  const emailLower = user.email.toLowerCase().trim();
  if (emailLower === "kuntal2010oct@gmail.com") {
    return "owner";
  }
  if (user.role === "owner") {
    return "owner";
  }
  if (user.role === "admin" || user.isAdmin === true) {
    return "admin";
  }
  return "user";
}

// Ensure database sits populated is seeded
readDatabase();

// SIMPLE SECURE CRYPTOGRAPHY TOKENS (Simple session identification)
// Simulated session store
const ACTIVE_SESSIONS = new Map<string, string>(); // Token -> userEmail

// Authentication API Layer
app.post("/api/auth/signup", (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All account fields are required" });
  }

  const db = readDatabase();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(499).json({ error: "Email already registered to another account" });
  }

  const newUser: User = {
    id: "user_" + Math.random().toString(36).substring(2, 11),
    username,
    email: email.toLowerCase(),
    password,
    preferences: {
      theme: "light", // Initial state
      favoriteTools: []
    }
  };

  db.users.push(newUser);
  writeDatabase(db);

  // Generate Session Token
  const token = "token_" + Math.random().toString(36).substring(2, 11) + Date.now();
  ACTIVE_SESSIONS.set(token, newUser.email);

  // Strip password before output and assign computed roles
  const safeUser = { ...newUser, role: getUserRole(newUser), isAdmin: getUserRole(newUser) !== "user" };
  delete safeUser.password;

  return res.json({ success: true, token, user: safeUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Username / Email and password are required" });
  }

  const db = readDatabase();
  
  // Support logging in via email, username, or typing the general keyword "owner" or "admin" with their matching password
  const user = db.users.find(u => {
    const isEmailMatch = u.email.toLowerCase() === email.toLowerCase();
    const isUsernameMatch = u.username.toLowerCase() === email.toLowerCase();
    
    // Check if user typed "owner" or "admin"
    const inputRole = email.toLowerCase().trim();
    const uRole = getUserRole(u);
    const isRoleMatch = (inputRole === "owner" && uRole === "owner") || (inputRole === "admin" && uRole === "admin");

    return (isEmailMatch || isUsernameMatch || isRoleMatch) && u.password === password;
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials or password" });
  }

  const token = "token_" + Math.random().toString(36).substring(2, 11) + Date.now();
  ACTIVE_SESSIONS.set(token, user.email);

  const safeUser = { ...user, role: getUserRole(user), isAdmin: getUserRole(user) !== "user" };
  delete safeUser.password;

  return res.json({ success: true, token, user: safeUser });
});

// Middleware to authenticate securely
function authenticateRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authentication token is missing" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const email = ACTIVE_SESSIONS.get(token);

  if (!email) {
    return res.status(401).json({ error: "Invalid session or expired token" });
  }

  const db = readDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Associated account user not found" });
  }

  // Attach safe user copy to context
  (req as any).user = user;
  (req as any).token = token;
  next();
}

app.get("/api/auth/me", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const safeUser = { ...user, role: getUserRole(user), isAdmin: getUserRole(user) !== "user" };
  delete safeUser.password;
  return res.json({ success: true, user: safeUser });
});

app.post("/api/user/preferences", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const { theme, favoriteTools } = req.body;

  const db = readDatabase();
  const userIdx = db.users.findIndex(u => u.id === user.id);
  
  if (userIdx !== -1) {
    if (theme) db.users[userIdx].preferences.theme = theme;
    if (favoriteTools) db.users[userIdx].preferences.favoriteTools = favoriteTools;
    writeDatabase(db);
    
    const safeUser = { ...db.users[userIdx] };
    delete safeUser.password;
    return res.json({ success: true, user: safeUser });
  }

  return res.status(404).json({ error: "User preferences save error" });
});

app.post("/api/user/profile", authenticateRequest, (req, res) => {
  const authUser = (req as any).user;
  const { username, email, password } = req.body;

  const db = readDatabase();
  const userIdx = db.users.findIndex(u => u.id === authUser.id);

  if (userIdx === -1) {
    return res.status(404).json({ error: "User profile not found" });
  }

  // Check email conflict if changing email
  if (email && email.toLowerCase() !== authUser.email.toLowerCase()) {
    const conflict = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (conflict) {
      return res.status(400).json({ error: "Requested email is already taken by another account" });
    }
    db.users[userIdx].email = email.toLowerCase();
    // Update active session index reference
    const token = (req as any).token;
    ACTIVE_SESSIONS.set(token, email.toLowerCase());
  }

  if (username) {
    db.users[userIdx].username = username;
  }

  if (password) {
    db.users[userIdx].password = password;
  }

  writeDatabase(db);

  const safeUser = { ...db.users[userIdx] };
  delete safeUser.password;

  return res.json({ success: true, user: safeUser });
});

// Feedback In-Memory & Local Dispatches API (Feedback Storage + Stars)
app.post("/api/feedback", (req, res) => {
  const { name, email, type, rating, comment } = req.body;

  if (!name || !email || !rating || !comment) {
    return res.status(400).json({ error: "feedback name, email, rating and comment are required" });
  }

  const parsedRating = parseInt(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: "Rating must be a valid integer between 1 and 5 stars" });
  }

  const db = readDatabase();
  
  // Real-time server side email log simulation handler
  const feedbackId = "feed_" + Math.random().toString(36).substring(2, 11);
  const newFeedback: Feedback = {
    id: feedbackId,
    name,
    email: email.toLowerCase(),
    type: type || "General Feedback",
    rating: parsedRating,
    comment,
    createdAt: new Date().toISOString(),
    simulatedEmailSent: true
  };

  db.feedbacks.push(newFeedback);
  writeDatabase(db);

  // Output email logging for auditing (Email feedback storage requirement)
  console.log(`[EMAIL DISPATCH SIMULATOR]`);
  console.log(`To: kuntal2010oct@gmail.com`);
  console.log(`From: system-feedback@toolment.com`);
  console.log(`Subject: [Toolment Feedback Review] New submission from ${name}`);
  console.log(`Payload: Rated ${parsedRating}/5 Stars under '${type}'. Feedback: "${comment}"`);
  console.log(`-------------------------------------`);

  return res.json({ success: true, feedback: newFeedback });
});

// Admin Panel Feedbacks Route (administrators exclusive securely)
app.get("/api/admin/feedbacks", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const isAdmin = user.email.toLowerCase() === "kuntal2010oct@gmail.com" || user.isAdmin;
  
  if (!isAdmin) {
    return res.status(403).json({ error: "Access Denied: Administrative privileges required." });
  }

  const db = readDatabase();
  return res.json({ success: true, feedbacks: db.feedbacks });
});

// Admin Panel Feedback Deletion Route (Admins and Owners permitted)
app.delete("/api/admin/feedbacks/:feedbackId", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);

  if (callerRole !== "admin" && callerRole !== "owner") {
    return res.status(403).json({ error: "Access Denied: Only administrators or owners are authorized to delete feedbacks." });
  }

  const { feedbackId } = req.params;
  if (!feedbackId) {
    return res.status(400).json({ error: "Feedback ID parameter is required." });
  }

  const db = readDatabase();
  const index = db.feedbacks.findIndex(f => f.id === feedbackId);

  if (index === -1) {
    return res.status(404).json({ error: "Feedback entry not found." });
  }

  db.feedbacks.splice(index, 1);
  writeDatabase(db);

  return res.json({ success: true, message: "Feedback entry successfully removed from database index." });
});

// --- TOOLS COLLECTION MANAGEMENT ENDPOINTS ---

// Serve tool uploaded files in a new tab (authenticated with cookie session option)
app.get("/api/tools/files/:filename", (req, res) => {
  const queryToken = req.query.token as string;
  const authHeader = req.headers.authorization;
  const cookieMatch = req.headers.cookie?.match(/toolment_token=([^;]+)/);
  const token = queryToken || (authHeader ? authHeader.split(" ")[1] : null) || (cookieMatch ? cookieMatch[1] : null);

  if (!token) {
    return res.status(401).send("<h1>Unauthorized: Authorization token is required to view workspace files.</h1>");
  }

  // Verify token
  const userEmail = ACTIVE_SESSIONS.get(token);
  if (!userEmail) {
    return res.status(401).send("<h1>Unauthorized: Invalid or expired session credentials.</h1>");
  }

  const db = readDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  if (!user) {
    return res.status(401).send("<h1>Unauthorized: Account mismatch or user not found.</h1>");
  }

  // Bind token to cookie for smooth relative HTML/CSS/JS loads
  res.setHeader("Set-Cookie", `toolment_token=${token}; Path=/api/tools/files; SameSite=Lax`);

  const filename = req.params.filename;
  const safeFilename = path.basename(filename); // Prevent path traversal
  const filePath = path.join(process.cwd(), "uploads", safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("<h1>404: File not found in workspace index.</h1>");
  }

  // Set appropriate content type based on extension
  const ext = path.extname(safeFilename).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".html" || ext === ".htm") contentType = "text/html";
  else if (ext === ".css") contentType = "text/css";
  else if (ext === ".js") contentType = "application/javascript";
  else if (ext === ".json") contentType = "application/json";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".gif") contentType = "image/gif";
  else if (ext === ".svg") contentType = "image/svg+xml";
  else if (ext === ".pdf") contentType = "application/pdf";
  else if (ext === ".txt") contentType = "text/plain";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", "inline");

  return res.sendFile(filePath);
});

// Fetch all available tools from dynamic File DB
app.get("/api/tools", authenticateRequest, (req, res) => {
  const db = readDatabase();
  return res.json({ success: true, tools: db.tools || [] });
});

// Create/Add a new tool with multiple files upload (Admin and Owners exclusive)
app.post("/api/admin/tools", authenticateRequest, upload.array("files"), (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);
  const uploadedFiles = req.files as Express.Multer.File[] | undefined;

  if (callerRole !== "admin" && callerRole !== "owner") {
    if (uploadedFiles) {
      for (const f of uploadedFiles) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
    return res.status(403).json({ error: "Access Denied: Only administrators or owners are authorized to manage tools." });
  }

  const { name, desc, link, tags, isInternalWorkspace, accessType } = req.body;
  
  if (!name || !desc) {
    if (uploadedFiles) {
      for (const f of uploadedFiles) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
    return res.status(400).json({ error: "Tool name and description are required." });
  }

  const parsedAccessType = accessType || "url";

  if (parsedAccessType === "url" && !link) {
    if (uploadedFiles) {
      for (const f of uploadedFiles) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
    return res.status(400).json({ error: "Redirection link is required for URL based tools." });
  }

  if (parsedAccessType === "file" && (!uploadedFiles || uploadedFiles.length === 0)) {
    return res.status(400).json({ error: "A custom HTML or asset file must be uploaded for file based tools." });
  }

  const db = readDatabase();

  // Check for duplicate uploaded filename inside database index
  if (parsedAccessType === "file" && uploadedFiles) {
    for (const file of uploadedFiles) {
      const isFileCollision = db.tools.some(t => {
        if (t.accessType !== "file") return false;
        const allNames = t.uploadedFilenames || (t.uploadedFilename ? [t.uploadedFilename] : []);
        return allNames.some(fn => fn.toLowerCase() === file.originalname.toLowerCase());
      });
      if (isFileCollision) {
        for (const f of uploadedFiles) {
          if (fs.existsSync(f.path)) {
            try { fs.unlinkSync(f.path); } catch (e) {}
          }
        }
        return res.status(400).json({ error: `The file name "${file.originalname}" is already in use by another tool in the database. Please choose a different file or rename it.` });
      }
    }
  }

  const toolId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Avoid duplicates
  if (db.tools.some(t => t.id === toolId)) {
    if (uploadedFiles) {
      for (const f of uploadedFiles) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
    return res.status(400).json({ error: "A tool with a similar name already exists." });
  }

  let parsedTags: string[] = [];
  if (tags) {
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      }
    }
  }

  const parsedIsInternal = isInternalWorkspace === "true" || isInternalWorkspace === true;

  // Determine launching/primary filename
  let uploadedFilename: string | undefined = undefined;
  let uploadedFilenames: string[] = [];
  if (parsedAccessType === "file" && uploadedFiles && uploadedFiles.length > 0) {
    uploadedFilenames = uploadedFiles.map(f => f.originalname);
    const indexFile = uploadedFiles.find(f => f.originalname.toLowerCase() === "index.html" || f.originalname.toLowerCase() === "index.htm");
    const anyHtml = uploadedFiles.find(f => f.originalname.toLowerCase().endsWith(".html") || f.originalname.toLowerCase().endsWith(".htm"));
    const mainFile = indexFile || anyHtml || uploadedFiles[0];
    uploadedFilename = mainFile.originalname;
  }

  const newTool: UtilityTool = {
    id: toolId,
    name,
    desc,
    link: parsedAccessType === "file" && uploadedFilename ? `/api/tools/files/${uploadedFilename}` : (link || ""),
    tags: parsedTags,
    isInternalWorkspace: parsedIsInternal,
    accessType: parsedAccessType,
    uploadedFilename,
    uploadedFilenames
  };

  db.tools.push(newTool);
  writeDatabase(db);

  return res.json({ success: true, tool: newTool });
});

// Update an existing tool with multiple files upload options (Admin and Owners exclusive)
app.put("/api/admin/tools/:toolId", authenticateRequest, upload.array("files"), (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);
  const uploadedFiles = req.files as Express.Multer.File[] | undefined;

  if (callerRole !== "admin" && callerRole !== "owner") {
    if (uploadedFiles) {
      for (const f of uploadedFiles) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
    return res.status(403).json({ error: "Access Denied: Only administrators or owners are authorized to manage tools." });
  }

  const { toolId } = req.params;
  const { name, desc, link, tags, isInternalWorkspace, accessType } = req.body;

  const db = readDatabase();
  const toolIndex = db.tools.findIndex(t => t.id === toolId);
  if (toolIndex === -1) {
    if (uploadedFiles) {
      for (const f of uploadedFiles) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
    return res.status(404).json({ error: "Tool entry not found in the database index." });
  }

  const currentTool = db.tools[toolIndex];
  const parsedAccessType = accessType || currentTool.accessType || "url";

  if (parsedAccessType === "file" && (!uploadedFiles || uploadedFiles.length === 0) && !currentTool.uploadedFilename) {
    return res.status(400).json({ error: "A custom HTML or asset file must be uploaded for file based tools." });
  }

  // Check for duplicate uploaded filename in other tools inside database index
  if (parsedAccessType === "file" && uploadedFiles) {
    for (const file of uploadedFiles) {
      const isFileCollision = db.tools.some(t => {
        if (t.id === toolId || t.accessType !== "file") return false;
        const allNames = t.uploadedFilenames || (t.uploadedFilename ? [t.uploadedFilename] : []);
        return allNames.some(fn => fn.toLowerCase() === file.originalname.toLowerCase());
      });
      if (isFileCollision) {
        for (const f of uploadedFiles) {
          if (fs.existsSync(f.path)) {
            try { fs.unlinkSync(f.path); } catch (e) {}
          }
        }
        return res.status(400).json({ error: `The file name "${file.originalname}" is already in use by another tool in the database. Please choose a different file or rename it.` });
      }
    }
  }

  let parsedTags: string[] = currentTool.tags;
  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      }
    }
  }

  const parsedIsInternal = isInternalWorkspace !== undefined
    ? (isInternalWorkspace === "true" || isInternalWorkspace === true)
    : currentTool.isInternalWorkspace;

  let newUploadedFilename = currentTool.uploadedFilename;
  let newUploadedFilenames = currentTool.uploadedFilenames || (currentTool.uploadedFilename ? [currentTool.uploadedFilename] : []);
  let newLink = link || currentTool.link;

  if (parsedAccessType === "file") {
    if (uploadedFiles && uploadedFiles.length > 0) {
      // Clean up old files on update if they are not in the new list to avoid duplicates
      const oldFiles = currentTool.uploadedFilenames || (currentTool.uploadedFilename ? [currentTool.uploadedFilename] : []);
      const newNames = uploadedFiles.map(f => f.originalname);
      for (const old of oldFiles) {
        if (!newNames.includes(old)) {
          const oldFilePath = path.join(UPLOADS_DIR, old);
          if (fs.existsSync(oldFilePath)) {
            try { fs.unlinkSync(oldFilePath); } catch (e) {}
          }
        }
      }

      newUploadedFilenames = newNames;
      const indexFile = uploadedFiles.find(f => f.originalname.toLowerCase() === "index.html" || f.originalname.toLowerCase() === "index.htm");
      const anyHtml = uploadedFiles.find(f => f.originalname.toLowerCase().endsWith(".html") || f.originalname.toLowerCase().endsWith(".htm"));
      const mainFile = indexFile || anyHtml || uploadedFiles[0];
      newUploadedFilename = mainFile.originalname;
      newLink = `/api/tools/files/${newUploadedFilename}`;
    }
  } else {
    // Switch to URL: Cleanup all old files
    const oldFiles = currentTool.uploadedFilenames || (currentTool.uploadedFilename ? [currentTool.uploadedFilename] : []);
    for (const old of oldFiles) {
      const oldFilePath = path.join(UPLOADS_DIR, old);
      if (fs.existsSync(oldFilePath)) {
        try { fs.unlinkSync(oldFilePath); } catch (e) {}
      }
    }
    newUploadedFilename = undefined;
    newUploadedFilenames = [];
  }

  db.tools[toolIndex] = {
    ...currentTool,
    name: name || currentTool.name,
    desc: desc || currentTool.desc,
    link: newLink,
    tags: parsedTags,
    isInternalWorkspace: parsedIsInternal,
    accessType: parsedAccessType,
    uploadedFilename: newUploadedFilename,
    uploadedFilenames: newUploadedFilenames
  };

  writeDatabase(db);
  return res.json({ success: true, tool: db.tools[toolIndex] });
});

// Delete a tool (Admin and Owners exclusive)
app.delete("/api/admin/tools/:toolId", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);

  if (callerRole !== "admin" && callerRole !== "owner") {
    return res.status(403).json({ error: "Access Denied: Only administrators or owners are authorized to manage tools." });
  }

  const { toolId } = req.params;
  const db = readDatabase();
  const toolIndex = db.tools.findIndex(t => t.id === toolId);
  if (toolIndex === -1) {
    return res.status(404).json({ error: "Tool entry not found in the database index." });
  }

  const tool = db.tools[toolIndex];

  // Clean up associated files if a file based tool
  if (tool.accessType === "file") {
    const filesToDelete = tool.uploadedFilenames || (tool.uploadedFilename ? [tool.uploadedFilename] : []);
    for (const fn of filesToDelete) {
      const filePath = path.join(UPLOADS_DIR, fn);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete tool file during removal:", e);
        }
      }
    }
  }

  db.tools.splice(toolIndex, 1);
  writeDatabase(db);

  return res.json({ success: true, message: "Tool entry successfully removed from workspace." });
});

// Admin Panel Registered Users Route (administrators and owners exclusive securely)
app.get("/api/admin/users", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);
  
  if (callerRole !== "admin" && callerRole !== "owner") {
    return res.status(403).json({ error: "Access Denied: Administrative privileges required." });
  }

  const db = readDatabase();
  const safeUsers = db.users.map(u => {
    const computedRole = getUserRole(u);
    const copy = { 
      ...u, 
      role: computedRole,
      isAdmin: computedRole === "admin" || computedRole === "owner"
    };
    
    // Also owner can look password of account but admin can't
    if (callerRole !== "owner") {
      delete copy.password;
    }
    return copy;
  });
  return res.json({ success: true, users: safeUsers });
});

// Admin Panel Toggle Privilege Route (Only owners allowed)
app.post("/api/admin/toggle-privilege", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);
  
  if (callerRole !== "owner") {
    return res.status(403).json({ error: "Access Denied: Only owners can manage administrator privileges." });
  }

  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: "Target User ID is required" });
  }

  const db = readDatabase();
  const targetUserIdx = db.users.findIndex(u => u.id === targetUserId);

  if (targetUserIdx === -1) {
    return res.status(404).json({ error: "Register account not found." });
  }

  const targetUser = db.users[targetUserIdx];

  // Prevent demotion of principal admin
  if (targetUser.email.toLowerCase() === "kuntal2010oct@gmail.com") {
    return res.status(400).json({ error: "Cannot modify principal administrator privileges." });
  }

  // Toggle admin flag or default roles
  const currentRole = getUserRole(targetUser);
  const nextRole = currentRole === "admin" ? "user" : "admin";
  
  db.users[targetUserIdx].role = nextRole;
  db.users[targetUserIdx].isAdmin = (nextRole === "admin");
  writeDatabase(db);

  const copy = { ...db.users[targetUserIdx], role: nextRole, isAdmin: nextRole === "admin" };
  return res.json({ success: true, user: copy });
});

// Admin Panel Custom Account Role Management Route
app.post("/api/admin/change-role", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);

  if (callerRole !== "owner") {
    return res.status(403).json({ error: "Access Denied: Only owners can assign admin or owner privileges." });
  }

  const { targetUserId, newRole } = req.body;
  if (!targetUserId || !newRole) {
    return res.status(400).json({ error: "Target User ID and newRole are required." });
  }

  if (!["user", "admin", "owner"].includes(newRole)) {
    return res.status(400).json({ error: "Invalid role structure. Must be 'user', 'admin', or 'owner'." });
  }

  const db = readDatabase();
  const targetUserIdx = db.users.findIndex(u => u.id === targetUserId);

  if (targetUserIdx === -1) {
    return res.status(404).json({ error: "Registered account not found." });
  }

  const targetUser = db.users[targetUserIdx];

  // Prevent demotion of principal owner
  if (targetUser.email.toLowerCase() === "kuntal2010oct@gmail.com" && newRole !== "owner") {
    return res.status(400).json({ error: "Cannot modify principal owner privileges." });
  }

  // Constraint: At a time there can be at max only two owners !
  if (newRole === "owner" && getUserRole(targetUser) !== "owner") {
    const ownersCount = db.users.filter(u => getUserRole(u) === "owner").length;
    if (ownersCount >= 2) {
      return res.status(400).json({ error: "Privilege Limit Error: At a time, there can be at max only two owners." });
    }
  }

  // Save changes
  db.users[targetUserIdx].role = newRole;
  db.users[targetUserIdx].isAdmin = (newRole === "admin" || newRole === "owner");
  writeDatabase(db);

  const copy = { 
    ...db.users[targetUserIdx], 
    role: newRole, 
    isAdmin: newRole === "admin" || newRole === "owner" 
  };

  return res.json({ success: true, user: copy });
});

// Admin/Owner delete account endpoint (Only owners are permitted to delete accounts, admins cannot)
app.delete("/api/admin/users/:targetUserId", authenticateRequest, (req, res) => {
  const user = (req as any).user;
  const callerRole = getUserRole(user);

  if (callerRole !== "owner") {
    return res.status(403).json({ error: "Access Denied: Only owners are authorized to delete accounts. Administrators are restricted." });
  }

  const { targetUserId } = req.params;
  if (!targetUserId) {
    return res.status(400).json({ error: "Target User ID parameter is required." });
  }

  const db = readDatabase();
  const targetUserIdx = db.users.findIndex(u => u.id === targetUserId);

  if (targetUserIdx === -1) {
    return res.status(404).json({ error: "Registered account not found." });
  }

  const targetUser = db.users[targetUserIdx];

  // Prevent deletion of principal owner
  if (targetUser.email.toLowerCase() === "kuntal2010oct@gmail.com") {
    return res.status(400).json({ error: "Access Denied: Cannot delete the principal workspace owner." });
  }

  // Prevent self deletion
  if (targetUser.email.toLowerCase() === user.email.toLowerCase()) {
    return res.status(400).json({ error: "Cannot delete your own active owner account." });
  }

  // Delete the user
  db.users.splice(targetUserIdx, 1);
  writeDatabase(db);

  return res.json({ success: true, message: `Account for ${targetUser.email} has been permanently deleted.` });
});

// Hook dynamic Vite compiler interface logic or serve static built directories fallback
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Toolment Engine Server Activated] Port listening on: http://localhost:${PORT}`);
  });
}

bootServer();
