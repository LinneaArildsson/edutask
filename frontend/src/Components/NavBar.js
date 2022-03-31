import React, { useState} from 'react';
import './../Styles/NavBar.css'

// import icons
import { ReactComponent as CaretIcon } from './../Icons/caret.svg';
import { ReactComponent as ArrowIcon } from './../Icons/arrow.svg';

function NavBar(props) {
    return (
        <nav className="navbar">
            <ul className="navbar-nav">
                <NavItem icon="😴" id='1'/>
                <NavItem icon={<CaretIcon />} id='2'>
                    <DropdownMenu Logout={props.Logout} />
                </NavItem>
            </ul>
        </nav>
    );
}

function NavItem(props) {
    const [open, setOpen] = useState(false);

    return (
        <li className='nav-item' key={props.id}>
            <a href='#' className='icon-button' onClick={() => setOpen(!open)}>
                {props.icon}
            </a>
            {open && props.children}
        </li>
    );
}

function DropdownMenu(props) {
    function DropdownItem(props) {
        const selectItem = (e, fun) => {
            e.preventDefault();
    
            fun();
        }

        return (
            <a href='#' className="menu-item" key={props.id}  onClick={(e) => {selectItem(e, props.Logout)}} >
                <span className='icon-button'>{props.leftIcon}</span>
                {props.children}
            </a>
        )
    }

    return (
        <div className='dropdown'>
            <DropdownItem id='1'>My Tasks</DropdownItem>
            <DropdownItem id='2'>My Profile</DropdownItem>
            <DropdownItem id='3' Logout={props.Logout} leftIcon={<ArrowIcon />}>Logout</DropdownItem>
        </div>
    );
}

export default NavBar