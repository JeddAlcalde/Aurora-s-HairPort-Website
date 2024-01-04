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
        id = validation.validId(id, "Id");
        const employeeCollection = await employees();
        const employee = await employeeCollection.findOne({ _id: new ObjectId(id) });
        if (!employee) throw 'Error: employee not found';
        return employee;
    },
    async getEmployeeByEmail(email) {
        email = validation.validEmail(email, "email").toLowerCase();
        const employeeCollection = await employees();
        const employee = await employeeCollection.findOne({ email: email });
        if (!employee) throw 'Error: Employee not found';
        return employee;
    },
    async registerEmployee(firstName, lastName, email, password, confirmPassword, phoneNum) {
        //used to validate an employees first login
        //used AFTER admin create a newEmployee()
        try {
            firstName = validation.validString(firstName, 'First Name');
            lastName = validation.validString(lastName, 'Last Name');
            email = validation.validEmail(email, 'Email').toLowerCase();
            password = validation.validPassword(password);
            confirmPassword = validation.validPassword(confirmPassword);
            phoneNum = validation.validPhoneNumber(phoneNum, "Phone Number");
        } catch (e) {
            throw e;
        }

        const employeeCollection = await employees();

        const findEmail = await employeeCollection.findOne({ email: email.toLowerCase() });
        if (!findEmail) {
            throw `Error: email doesn't exist, make sure admin employee admits new employee.`;
        }

        const findPhoneNum = await employeeCollection.findOne({ email: email.toLowerCase() });
        if (findPhoneNum) {
            throw `Error: phone number already exists, pick another.`;
        }

        if (password !== confirmPassword) {
            throw 'Error: Passwords must be the same';
        }
        
        const hashedPassword = await bcrypt.hash(password, 16);

        const employeeInfo = await employeeCollection.findOne({ email: email });

        const updateEmployeeInfo = await employeeCollection.updateOne(
            { _id: employeeInfo._id },
            { $push: { phoneNum: phoneNum } },
            { $push: {password: hashedPassword} },
            { $push: {active : true} }
        );
        return { registeredEmployee: true };
    },
    async loginEmployee(email, password) {
        //only usable once an employee has been admitted and registered IN THAT ORDER.
        const employeeCollection = await employees()

        try {
            email = validation.validEmail(email, 'Email').toLowerCase();
            password = validation.validPassword(password);
        } catch (e) {
            throw e;
        }

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
    },
    async admitNewEmployee(firstName, lastName, email, employeeRole){
        //only accessible by admin role
        //creates new employee, newly admitted employees need to register only once and then can login
        try {
            firstName = validation.validString(firstName, 'First Name');
            lastName = validation.validString(lastName, 'Last Name');
            email = validation.validEmail(email, 'Email').toLowerCase();
        } catch (e) {
            throw e;
        }

        try{
            if(employeeRole !== "admin"){
                throw "employees without admin role cannot admit new employees";
            }
        }
        catch(e){
            throw e;
        }

        const employeeCollection = await employees();

        const findEmail = await employeeCollection.findOne({ email: email.toLowerCase() });
        if (findEmail) {
            throw `Error: email already exists, pick another.`;
        }

        let newEmployee = {
            email: email,
            phoneNum: "",
            password: "",
            firstName: firstName,
            lastName: lastName,
            bookedHours : [],
            averageRating : 0,
            services : [],
            role : "",
            active : false
        }

        let insertInfo = await employeeCollection.insertOne(newEmployee);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add employee';
        }
        return { admittedEmployee: true };
    }
}

export default exportedMethods;