import express from "express"
import Todos from "../models/todos.js"
import protect from "../middleware/middleware.js"


const router = express.Router()

//create tasks
router.post("/task/profile/new-tasks", protect, async (req, res) => {
  try {
    const user = req.user
    console.log("USER:", req.user);
    const {
        title,
        description,
        tags,
        scheduledDate
    } = req.body;
    console.log(req.body);
    
    if (!title) {
    return res.status(400).json({ message: "Title is required" });
    }
    

  const todo = new Todos({
      user: user._id,
      title,
      description,
      tags,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
    });

    await todo.save();
    res.status(201).json({ message: 'Task created successfully', todo });

  } catch (err) {
    console.error('Task error:', err.message);
    res.status(500).json({ message: 'Server error'});
  }
});

//get all tasks
router.get("/task/profile/all-tasks", protect, async (req, res) => {
    try {
        const tasks = await Todos.find({user: req.user._id}).sort({createdAt: -1})
        res.json({tasks})

    } catch (err) {
        res.status(500).json({message: "Server error"})
    }
});

//get one task
router.get("/task/profile/all-tasks/:id", protect, async (req, res) => {
    try {
        const task = await Todos.findOne({_id: req.params.id, user: req.user._id})

        if (!task) {
           return res.status(404).json({message: "Task not found"})
        }
        res.json({task})

    } catch (err) {
        res.status(500).json({message: "Server error"})
    }
});

router.put("/task/profile/all-tasks/:id", protect, async (req, res) => {
    try {
        const {title, description, tags, scheduledDate} = req.body
        
        const task = await Todos.findOne({_id: req.params.id, user: req.user._id})
        if (!task) {
           return res.status(404).json({message: "Task not found"})
        }
        // Update fields only if provided
        task.title = title || task.title;
        task.description = description || task.description;
        task.tags = tags || task.tags;
        task.scheduledDate = scheduledDate ? new Date(scheduledDate): task.scheduledDate;

        await task.save();

        res.json({
            message: "Updated Successfully",
            task
        })

    } catch (err) {
        res.status(500).json({message: "Server error"})
    }
})

router.delete("/task/profile/all-tasks/:id", protect, async (req, res) => {
    try {
        const task = await Todos.findOneAndDelete({_id: req.params.id, user: req.user._id})
        if (!task) {
           return res.status(404).json({message: "Task not found"})
        }

        res.json({
            message: "Task deleted successfully",
        })
    } catch (err) {
        res.status(500).json({message: "Server error"})
    }
})

router.get("/task/profile/all-tasks/search", protect, async (req, res) => {
  try {
    const { query, tags } = req.query;

    let filter = {
      user: req.user._id,
    };

    // Text search (title + description)
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Filter by tag
    if (tags) {
      filter.tags = tags;
    }

    const tasks = await Todos.find(filter).sort({ createdAt: -1 });

    res.json(tasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router