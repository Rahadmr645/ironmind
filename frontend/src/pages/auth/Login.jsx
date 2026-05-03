import React, { useEffect, useContext, useState } from 'react';
import './Login.css';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { currState, setCurrState, setShowLogin, URL, } = useContext(AuthContext);

  const [isFormValid, setIsFormValid] = useState(false);


  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePic: '',

  });


  useEffect(() => {
    document.body.style.overflow = "hidden"


    return () => {
      document.body.style.overflow = "auto"
    }
  }, []);

  //chack formdata validation
  useEffect(() => {
    if (currState === 'SignUp') {
      setIsFormValid(
        formData.username.trim() !== '' && formData.email.trim() !== '' &&
        formData.password.trim() !== ''
      );
    } else {
      setIsFormValid(
        formData.email.trim() !== '' &&
        formData.password.trim() !== ''
      );
    }
  }, [formData, currState]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const submitHandler = async (e) => {
    e.preventDefault();
    const isSignUp = currState === 'SignUp';

    const endPoint =
      isSignUp
        ? `${URL}/api/user/create`
        : `${URL}/api/user/login`;

    const bodyData =
      isSignUp
        ? formData
        : { email: formData.email, password: formData.password };
    console.log(bodyData)


    try {
      const res = await axios.post(endPoint, bodyData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = res.data;
      alert(data?.message || 'Success');

      // Signup now returns OTP message (201) and no token until OTP verification.
      const token = data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // saving to the localstorage


      setFormData({
        username: '',
        email: '',
        password: ''
      });

      if (isSignUp) {
        localStorage.setItem('pendingVerifyEmail', bodyData.email.trim());
        navigate('/verify-otp', { state: { email: bodyData.email.trim() } });
        return;
      }


      if (!isSignUp && token) {
        navigate('/');
        setShowLogin(false);
        window.location.reload();
      }

    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;
      if (status === 403 && !isSignUp) {
        const email = formData.email.trim();
        if (email) {
          localStorage.setItem('pendingVerifyEmail', email);
          alert(backendMessage || 'Please verify your email with the OTP before logging in.');
          navigate('/verify-otp', { state: { email } });
          return;
        }
      }
      alert(backendMessage || `Request failed: ${error.message}`);
    }



  };



  return (
    <div className="loginForm-container">
      <form className="lgoinForm" onSubmit={submitHandler}>
        <div className="login-header">
          <p>{currState}</p>
        </div>

        {currState === 'SignUp' && (
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              onChange={handleChange}
              name="username"
              value={formData.username}
            />
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            onChange={handleChange}
            name="email"
            value={formData.email}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            onChange={handleChange}
            name="password"
            value={formData.password}
          />
        </div>


        <button type="submit" className="btn submitn-btn btn-primary submit-btn"
          disabled={!isFormValid}
          style={{
            backgroundColor: isFormValid ? 'green' : '#abaa8b',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
        >
          Submit
        </button>

        {currState === 'SignUp' ? (
          <p>
            Already have an account?{' '}
            <span className="span" onClick={() => setCurrState('Login')}>
              Click here
            </span>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <span className="span" onClick={() => setCurrState('SignUp')}>
              Click here
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;