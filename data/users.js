import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../validators.js';
import bcrypt from 'bcrypt';

const exportedMethods = {
    async getAllUsers() {
        const userCollection = await users();
        return await userCollection.find({}).toArray();
    },
    async getUserById(id) {
        id = validation.validId(id);
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        if (!user) throw 'Error: User not found';
        return user;
    },
    async getUserByEmail(email) {
        email = validation.validEmail(email).toLowerCase();
        const userCollection = await users();
        const user = await userCollection.findOne({ email: email });
        if (!user) throw 'Error: User not found';
        return user;
    },
    async registerUser(firstName, lastName, email, password, confirmPassword, phoneNum) {
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

        const userCollection = await users();

        const findEmail = await userCollection.findOne({ email: email.toLowerCase() });
        if (findEmail) {
            throw `Error: email already exists, pick another.`;
        }

        const findPhoneNum = await userCollection.findOne({ email: email.toLowerCase() });
        if (findPhoneNum) {
            throw `Error: phone number already exists, pick another.`;
        }

        if (password !== confirmPassword) {
            throw 'Error: Passwords must be the same';
        }
        
        const hashedPassword = await bcrypt.hash(password, 16);

        let newUser = {
            email: email,
            phoneNum: phoneNum,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            appointments : []
        }

        let insertInfo = await userCollection.insertOne(newUser);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add user';
        }
        return { insertedUser: true };
    },
    async loginUser(email, password) {
        const userCollection = await users()

        email = email.toLowerCase()
        const getUser = await userCollection.findOne({ email: email })
        if (getUser === null) {
            throw `Email is invalid`;
        }

        let passMatch = await bcrypt.compare(password, getUser.password)
        if (!passMatch) {
            throw `Password is invalid`;
        }
        return {
            email: getUser.email,
            phoneNum: getUser.phoneNum,
            firstName: getUser.firstName,
            lastName: getUser.lastName,
            appointments: getUser.appointments
        }
    }
}

export default exportedMethods;