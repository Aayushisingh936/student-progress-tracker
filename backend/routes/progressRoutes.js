import express from "express";
import Progress from "../models/Progress.js";

const router = express.Router();

router.post("/", async (req, res )=> {
    try {
        const newProgress = new Progress({
            studentName: req.body.studentName,
            courseName: req.body.courseName,
            completionPercentage: Number(req.body.completionPercentage)
        });

        const savedProgress = await newProgress.save();
        res.status(201).json({
            message: "Student progress added successfully",
            data: savedProgress
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to add progress",
            error: error.message
        })
    }
});
router.get("/", async (req, res) => {
    try {
        const progress = await Progress.find();
        res.json(progress);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get progress",
            error: error.message
        });
    }
});

router.delete("/", async (req, res) => {
    try {
        await Progress.deleteMany({});
        res.json({
            message: "All progress records deleted"
        })
    } catch (error){
        res.status(500).json({
            message:"Failed to delete records", error: error.message
        });
    }
})
export default router;
