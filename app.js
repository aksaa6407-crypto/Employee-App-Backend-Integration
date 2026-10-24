// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));
// Task2: create mongoDB connection 

const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('Successfully connected to MongoDB Atlas');
        })
        .catch((err) => {
            console.error('MongoDB Atlas connection error:', err.message);
        });
} else {
    console.warn('WARNING: MONGODB_URI is not set in environment or .env file.');
}

// Employee Mongoose Schema and Model
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Employee name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Employee location is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Employee position is required'],
        trim: true
    },
    salary: {
        type: Number,
        required: [true, 'Employee salary is required']
    }
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema); 


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'

app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        return res.status(200).json(employees);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error fetching employees from database' });
    }
});




//TODO: get single data from db  using api '/api/employeelist/:id'

app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Employee not found (invalid ID format)' });
        }
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        return res.status(200).json(employee);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error retrieving employee' });
    }
});





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        if (!name || !location || !position || salary === undefined || salary === null || salary === '') {
            return res.status(400).json({ error: 'All fields (name, location, position, salary) are required' });
        }
        if (isNaN(Number(salary))) {
            return res.status(400).json({ error: 'Salary must be a valid number' });
        }
        const newEmployee = new Employee({
            name: String(name).trim(),
            location: String(location).trim(),
            position: String(position).trim(),
            salary: Number(salary)
        });
        const savedEmployee = await newEmployee.save();
        return res.status(201).json(savedEmployee);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error saving employee to database' });
    }
});






//TODO: delete a employee data from db by using api '/api/employeelist/:id'

app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Employee not found (invalid ID format)' });
        }
        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        return res.status(200).json({ message: 'Employee deleted successfully', employee: deletedEmployee });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error deleting employee from database' });
    }
});





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

const handleUpdateEmployee = async (req, res) => {
    try {
        const id = req.params.id || req.body._id || req.body.id;
        if (!id) {
            return res.status(400).json({ error: 'Employee ID is required for update' });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Employee not found (invalid ID format)' });
        }

        const { name, location, position, salary } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = String(name).trim();
        if (location !== undefined) updateData.location = String(location).trim();
        if (position !== undefined) updateData.position = String(position).trim();
        if (salary !== undefined) {
            if (isNaN(Number(salary))) {
                return res.status(400).json({ error: 'Salary must be a valid number' });
            }
            updateData.salary = Number(salary);
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        return res.status(200).json(updatedEmployee);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error updating employee in database' });
    }
};

app.put('/api/employeelist', handleUpdateEmployee);
app.put('/api/employeelist/:id', handleUpdateEmployee);


//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



