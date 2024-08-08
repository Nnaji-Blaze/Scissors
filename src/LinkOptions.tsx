import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Confirm from "./Confirm";
import axios from "axios"

type Link = {
  id: string;
  userId: string;
  isLoggedIn: boolean;
  setMessage: (message: string) => void;
  userPassword: string;
  customLink: string;
};
interface Domain {
  id: string;
  domain: string;
}

const LinkOptions: React.FC<Link> = ({
  id,
  userId,
  isLoggedIn,
  setMessage,
  userPassword,
  customLink,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customDomains, setCustomDomains] = useState<Domain[]>([]);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  const removeProtocol = (url: string) => {
    return url.replace(/^https?:\/\//, "");
  };
  const removeDomain = async (domain: string) => {
    
    try {
      const response = await axios.delete(
        "https://users-api-scissors.onrender.com/remove-domain",
        {
          headers: {
            "Content-Type": "application/json",
          },
          data: { domain },
        }
      );

      if (response.data.success) {
        setCustomDomains(response.data.domains);
        const cleanedDomain = removeProtocol(domain);
        return !customDomains.some((d) => d.domain === cleanedDomain);
      }
    } catch (error) {
      console.error("Error removing domain:", error);
      setMessage("An error occurred while removing the domain.");
    }
  };
  const handleDelete = async (enteredPassword: string) => {
    if (isLoggedIn) {
      if (enteredPassword === userPassword) {
        try {
          const response = await fetch(
            `https://users-api-scissors.onrender.com/users/${userId}/links/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
        
          console.log(`Removed link with ID ${id} from the server`);
          const domain = removeProtocol(customLink);
          removeDomain(domain);
          setIsModalOpen(false);
          window.location.reload();
          setMessage(`You have successfully deleted the link with ID ${id}`);
        } catch (error) {
          console.error("Error deleting link from the server:", error);
          setIsModalOpen(false);
        }
      } else {
        setIsModalOpen(false);
        setMessage("Incorrect password. Please try again.");
      }
    } else {
      const links = localStorage.getItem("links");
      if (links) {
        
          const linksArray = JSON.parse(links);
          const updatedLinks = linksArray.filter((link: any) => link.id !== id);
          localStorage.setItem("links", JSON.stringify(updatedLinks));
          setIsModalOpen(false);
          console.log(`Removed link with ID ${id} from localStorage`);
          window.location.reload();
          setMessage(`You have successfully deleted the link with ID ${id}`);
      } else {
        console.log("No links found in localStorage");
      }
    }
    setShowOptions(false); // Close options after deletion
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node) &&
      optionsRef.current &&
      !optionsRef.current.contains(event.target as Node)
    ) {
      setShowOptions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div>
      <Confirm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        isLoggedIn={isLoggedIn}
        id={Link?.id}
      />
      <button
        className="px-2 py-2 h-9 grid grid-flow-col font-bold bg-gray-200 text-sm hover:bg-gray-300 rounded"
        onClick={toggleOptions}
        ref={buttonRef}
      >
        <span className="material-icons text-sm">more_vert</span>
      </button>
      {showOptions && (
        <div
          ref={optionsRef}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10"
        >
            <button
              className="w-full text-left px-2 py-2 font-bold grid grid-flow-col  text-sm hover:bg-gray-100"
              onClick={() => {
                setIsModalOpen(true); // Open modal to confirm deletion
                setShowOptions(false); // Close options
              }}
            >
              <div className="flex gap-3">
                <span className="material-icons ">delete</span>{" "}
                <p className="pt-1">Delete</p>
              </div>
            </button>
          
        
          <Link to={`/link/${id}`}>
            <button className="w-full text-left px-2 text-black hover:text-black py-2 font-bold grid grid-flow-col  text-sm hover:bg-gray-100">
              {" "}
              <div className="flex gap-3">
                {" "}
                <span className="material-icons">link</span> View link
                analystics
              </div>{" "}
            </button>
          </Link>
          <Link to={`/link/${id}`}>
            {" "}
            <button className="w-full text-left px-2 text-black hover:text-black py-2 font-bold grid grid-flow-col  text-sm hover:bg-gray-100">
              <div className="flex gap-3">
                <span className="material-icons">qr_code</span> View QR Code
              </div>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LinkOptions;
