const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

// Create a new issue
router.post('/', async (req, res) => {
    const issue = new Issue(req.body);
    await issue.save();
    res.send(issue);
});

// Get all issues
router.get('/', async (req, res) => {
    const issues = await Issue.find();
    res.send(issues);
});

// Update an issue
router.put('/:id', async (req, res) => {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(issue);
});

// Delete an issue
router.delete('/:id', async (req, res) => {
    await Issue.findByIdAndDelete(req.params.id);
    res.send({ message: 'Issue deleted' });
});

module.exports = router;
