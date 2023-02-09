const generateOTP = (): any => {
    var val = Math.floor(1000 + Math.random() * 9000);
    console.log(val);
    return val
};

export {generateOTP};