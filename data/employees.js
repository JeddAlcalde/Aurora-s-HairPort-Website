import { employees } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../validators.js';
import bcrypt from 'bcrypt';

const exportedMethods = {
    async getAllEmployees() {
        const employeeCollection = await employees();
        return await employeeCollection.find({}).toArray();
    },
    async getEmployeeById(id) {
        id = validation.validId(id);
        const employeeCollection = await employees();
        const employee = await employeeCollection.findOne({ _id: new ObjectId(id) });
        if (!employee) throw 'Error: employee not found';
        return employee;
    },
    async getEmployeeByEmail(email) {
        email = validation.validEmail(email).toLowerCase();
        const employeeCollection = await employees();
        const employee = await employeeCollection.findOne({ email: email });
        if (!employee) throw 'Error: Employee not found';
        return employee;
    },
    async registerEmployee(firstName, lastName, email, password, confirmPassword, phoneNum) {
        //need to design a way for admin to validate when an employee is being registered
        try {
            firstName = validation.validString(firstName, 'First Name');
            lastName = validation.validString(lastName, 'Last Name');
            email = validation.validEmail(email, 'Email').toLowerCase();
            password = validation.validPassword(password);
            confirmPassword = validation.validPassword(confirmPassword);
            phoneNum = validation.validPhoneNumber(phoneNum);
        } catch (e) {
            throw e;
        }

        const employeeCollection = await employees();

        const findEmail = await employeeCollection.findOne({ email: email.toLowerCase() });
        if (findEmail) {
            throw `Error: email already exists, pick another.`;
        }

        const findPhoneNum = await employeeCollection.findOne({ email: email.toLowerCase() });
        if (findPhoneNum) {
            throw `Error: phone number already exists, pick another.`;
        }

        if (password !== confirmPassword) {
            throw 'Error: Passwords must be the same';
        }
        
        const hashedPassword = await bcrypt.hash(password, 16);

        let newEmployee = {
            email: email,
            phoneNum: phoneNum,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            bookedHours : [],
            averageRating : 0,
            services : [],
            role : ""
        }

        let insertInfo = await employeeCollection.insertOne(newEmployee);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add employee';
        }
        return { insertedEmployee: true };
    },
    async loginEmployee(email, password) {
        const employeeCollection = await employees()

        email = email.toLowerCase()
        const getEmployee = await employeeCollection.findOne({ email: email })
        if (getEmployee === null) {
            throw `Email is invalid`;
        }

        let passMatch = await bcrypt.compare(password, getEmployee.password)
        if (!passMatch) {
            throw `Password is invalid`;
        }
        return {
            email: getEmployee.email,
            phoneNum: getEmployee.phoneNum,
            firstName: getEmployee.firstName,
            lastName: getEmployee.lastName,
            appointments: getEmployee.appointments,
            bookedHours: getEmployee.bookedHours,
            averageRating: getEmployee.averageRating,
            services: getEmployee.services,
            role : getEmployee.role
        }
    }
}

export default exportedMethods;