import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom';
import { RxDashboard } from "react-icons/rx";
import { MdOutlineTaskAlt } from "react-icons/md";
import { BiTaskX } from "react-icons/bi";
import { RiFocus3Line } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
const Sidebar = () => {

    const menuItems = [
        { path: '/', icon: <RxDashboard />, label: "Dashboard" },
        { path: '/task-complete', icon: <MdOutlineTaskAlt />, label: 'Task Complete' },
        { path: '/tasks-failed', icon: <BiTaskX />, label: "Focus Mode" },
        { path: '/focus', icon: <RiFocus3Line />, label: "Focus Mode" },
        { path: '/profile', icon: <CgProfile />, label: "Profile" },

    ];


    return (
        <div className='sidebar-container'>
            <h2>IronMind</h2>
            <div className="sideber-section">
                {menuItems.map((item, index) => (
                    <NavLink to={item.path} key={index} className='item-box' >
                        <p>{item.icon}</p>
                        <p className="d-none d-md-block">{item.label}</p>
                    </NavLink>
               ) )}
            </div>
        </div>
    )
}

export default Sidebar;