import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();



const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Local development URL
      "https://crm-frntd.onrender.com", // Production URL
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["universe fund", "franchise", "sub-franchise", "channel-partner"],
    },
    parentId: {
      type: String,
      required: function () {
        return this.userType !== "universe fund";  // parentId is required for non-universe fund roles
      },
    },
    parentType: {
      type: String,
      required: function () {
        return this.userType !== "universe fund";  // parentType is required for non-universe fund roles
      },
    },
    universeFundId: {
      type: String,
      required: function () {
        return this.userType === "universe fund"; // universeFundId is required for universe fund
      },
    },
    uniqueId: { // uniqueId is for non-universe fund roles
      type: String,
      required: function () {
        return this.userType !== "universe fund";  // uniqueId is required for non-universe fund roles
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);




mongoose
  .connect(process.env.MongoDb_Connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.Db_name,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });


// Backend: /login route
app.post("/login", async (req, res) => {
  try {
    // const { id, password, userType } = req.body;
    const { universeFundId, uniqueId, password, userType } = req.body;
    console.log("Received login data:", req.body);

    let user;
    // Validate the login credentials
    if (userType === "universe fund") {
      user = await User.findOne({ universeFundId, userType });
    } else {
      user = await User.findOne({ uniqueId, userType });
    }
    
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password." });
    }
    if (user.userType !== userType) {
      return res.status(400).json({ message: "User type mismatch." });
    }

// In your login route, before sending response
console.log("User found:", user);
console.log("Sending response:", {
  message: "Login successful",
  user: {
    id: user._id,
    name: user.name,
    userType: user.userType,
    parentId: user.parentId || user.universeFundId,
  }
});

    // Send user data along with parentId or universeFundId
    res.status(200).json({
      
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType,
        parentId: user.parentId || user.universeFundId, // Dynamically use parentId or universeFundId
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
});





  app.post("/register", async (req, res) => {
    try {
      const { name, phone, email, password, role, parentId, parentType, universeFundId, uniqueId } = req.body;
  
      // Normalize role
      const normalizedRole = role?.toLowerCase();
  
      // Ensure the required fields are passed based on the user type
      let user = {
        name,
        phone,
        email,
        password,
        userType: normalizedRole,
      };
  
      if (normalizedRole === "universe fund") {
        if (!universeFundId) {
          return res.status(400).json({ error: "Universe Fund ID is required" });
        }
        user = { ...user, universeFundId };
      } else {
        if (!uniqueId || !parentId || !parentType) {
          return res.status(400).json({ error: "Unique ID, Parent ID, and Parent Type are required" });
        }
        user = { ...user, uniqueId, parentId, parentType };
      }
  
      // Hash the password (consider using bcrypt for security)
      user.password = password; // Update to use hashedPassword after bcrypt implementation
  
      const newUser = new User(user);
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Error registering user" });
    }
  });
  
  
  
  app.get("/dashboard/:userType/:id", async (req, res) => {
    const { userType, id } = req.params;
    console.log("Dashboard request params:", { userType, id });
  
    try {
      let subordinates = [];
      let query = {};
  
      // For universe fund users, we need to check universeFundId
      if (userType === "universe fund") {
        const universeUser = await User.findById(id);
        console.log("Universe user found:", universeUser);
        if (!universeUser) {
          return res.status(404).json({ message: "User not found" });
        }
        query = { parentId: universeUser.universeFundId, userType: "franchise" };
      } 
      // For franchise users
      else if (userType === "franchise") {
        const franchiseUser = await User.findById(id);
        if (!franchiseUser) {
          return res.status(404).json({ message: "User not found" });
          
        }
        query = { parentId: franchiseUser.uniqueId, userType: "sub-franchise" };
      }
      // For sub-franchise users
      else if (userType === "sub-franchise") {
        const subFranchiseUser = await User.findById(id);
        if (!subFranchiseUser) {
          return res.status(404).json({ message: "User not found" });
        }
        query = { parentId: subFranchiseUser.uniqueId, userType: "channel-partner" };
        console.log("Query for subordinates:", query);
      }
  
      subordinates = await User.find(query);
      console.log("Found subordinates:", subordinates);
  
      // Only send essential fields
      const result = subordinates.map(subordinate => ({
        name: subordinate.name,
        phone: subordinate.phone,
        id: subordinate._id,
        uniqueId: subordinate.uniqueId,
        parentType: subordinate.userType,
      }));
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Server error while fetching dashboard data." });
    }
  });





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
