export default function Validation (name, email, password) {
    const errors = {}

    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,6}$/;
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
    

    if(name === "") {
        errors.name = "Name is required!";
    }

    if(email === "") {
        errors.email = "Email is required!";
    }

    if(password === "") {
        errors.password = "Password is required!";
    }

    if(!email_pattern.test(email)) {
        errors.email = "Email doesnt match requirements";
    }

    if(!password_pattern.test(password)) {
        errors.password = "Password doesnt match requirements";
    }


    return errors;
}