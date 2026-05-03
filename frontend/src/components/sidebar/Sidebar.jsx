import React, { useContext } from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom';
import { RxDashboard } from "react-icons/rx";
import { MdOutlineTaskAlt } from "react-icons/md";
import { BiTaskX } from "react-icons/bi";
import { RiFocus3Line } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { FaTasks } from "react-icons/fa";
import { AuthContext } from '../../context/AuthContext';
const Sidebar = () => {

    const { user } = useContext(AuthContext);

    const menuItems = [
        { path: '/', icon: <RxDashboard />, label: "Dashboard" },
        { path: '/task-complete', icon: <MdOutlineTaskAlt />, label: 'Task Complete' },
        { path: '/tasks-failed', icon: <BiTaskX />, label: "Task UnComplete" },
        { path: '/focus', icon: <RiFocus3Line />, label: "Focus Mode" },
        { path: '/profile', icon: <CgProfile />, label: "Profile" },

    ];

    if (user) {
        menuItems.push({ path: '/myAllTask', icon: <FaTasks />, label: "MyAllTasks" });
    }


    return (
        <nav className='sidebar-container' aria-label="Main navigation">
            <h2 className="sidebar-brand">IronMind</h2>
            <div className="sideber-section">
                {menuItems.map((item, index) => (
                    <NavLink
                        to={item.path}
                        key={index}
                        className={({ isActive }) => `item-box${isActive ? ' active' : ''}`}
                        title={item.label}
                    >
                        <span className="item-box__icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default Sidebar;