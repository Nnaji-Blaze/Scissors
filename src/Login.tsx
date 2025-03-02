import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./login.css";
import "./style.css";
import Loading from "./Loading";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const navigate = useNavigate();

  const hasAt = email.includes("@");
  const hasEmailSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(email);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const googleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const response = await fetch(
          "https://app-scissors-api.onrender.com/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("Sign In successful:", data);
          setMessage("You have successfully signed into your account!");
          setLoading(false);
          navigate("/dashboard");
        } else {
          setLoading(false);
          setMessage(data.message);
        }
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => setMessage(""), 500);
      }, 4500);

      return () => {
        clearTimeout(timer);
        setIsFadingOut(false);
      };
    }
  }, [message]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await fetch(
        "https://app-scissors-api.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful");
        navigate("/dashboard");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage(
        "An error occurred during login. Check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid grid-coln body">
      <div
        className="max-w-screen-md w-full min-w-fit form-size"
        style={{ maxWidth: "100%" }}
      >
        <form onSubmit={handleEmailLogin} className="">
          <div className="mt-32 grid grid-flow-col w-40">
            <Link to="/">
              <img
                alt="Scissors"
                src="/Scissors_logo.png"
                className="h-8 w-auto"
              />
            </Link>
            <p className="font-black text-2xl rotate-0 mb-10 spacious">
              Scissors
            </p>
          </div>
          <p className="text-4xl mb-5 font-extrabold text-green-700 text-center">
            Sign in
          </p>

          <button
            className="mt-4 shadow h-12 w-full  text-center my-7 font-medium active:bg-green-700 hover:bg-green-700 text-green hover:text-white py-2 px-4 rounded-md transition-colors duration-1000 outline outline-1 focus:outline-none focus:text-white focus:bg-green-700 active:ring-green-600 text-xl"
            onClick={googleSignIn}
          >
            Continue with Google
          </button>

          <div className="m-space">
            <div className="inline">
              <div className="line"></div>
              <div className="line correct-line"></div>
              <div className="text-center">or</div>
            </div>
          </div>
        </form>
        <form onSubmit={handleEmailLogin}>
          {message && (
            <div
              className={`flex justify-center transition-opacity duration-500 ${
                isFadingOut ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className="fixed animate-message bg-black p-4 mx-4 rounded"
                style={{ top: "10%" }}
              >
                <p className=" text-red-100">{message}</p>
              </div>{" "}
            </div>
          )}{" "}
          {/* Display login message */}
          <label className="block">
            <span className="block text-base font-bold text-slate-700">
              Email address
            </span>
            <input
              type="email"
              placeholder="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className={`peer h-12 mt-1 block w-full px-3 mb-2 py-2 bg-white border border-slate-300 rounded-md text-m shadow-sm placeholder-slate-400
                  ${
                    email && !hasAt && hasEmailSymbol
                      ? "border-pink-500 text-pink-600"
                      : "border-slate-300"
                  } rounded-sm text-m shadow-sm placeholder-slate-400
                    focus:outline-none  focus:ring-gray-400 focus:ring-1 
                    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                    ${
                      email && !hasAt && hasEmailSymbol
                        ? "focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
                        : ""
                    }`}
            />
            {email && !hasAt && hasEmailSymbol && (
              <p className="mt-1 -mb-2 peer-invalid:visible text-pink-600 text-sm">
                Please provide a valid email address.
              </p>
            )}
          </label>
          <label className="block mt-4">
            <span className="block text-base font-bold text-slate-700">
              Password
            </span>
            <input
              type="password"
              placeholder="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-12 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-m shadow-sm placeholder-slate-400
              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
             "
            />
          </label>
          <a
            className="block mt-2 text-right text-sky-500 hover:underline"
            href="#"
          >
            Forgot password?
          </a>
          <button
            type="submit"
            className="mt-4 h-12 w-full text-center my-7 font-medium bg-green-700 hover:bg-green-800 text-white hover:text-white py-2 px-4 rounded-md transition-colors duration-1000 focus:outline-none focus:ring-2 focus:ring-green-600 active:ring-green-600 text-xl"
          >
            Sign in
          </button>
          <div className="center">
            <div className="mt-5 justify-center items-center text-center place-content-center">
              <p className="place-content-center">
                Don&apos;t have an account?{" "}
                <Link to="/signup">
                  <a>Sign up</a>
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center animate-pulse">
            <img
              src="/Scissors_logo.png"
              alt="Scissors"
              className="h-32 my-8"
            />
          </div>
          <p className="mb-10 text-center">© 2024 Scissors</p>
        </form>
      </div>
      <div className="scissors-background"></div>
    </div>
  );
};

export default Login;
