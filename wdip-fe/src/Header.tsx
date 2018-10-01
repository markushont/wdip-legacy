import * as React from 'react';
import './Header.css';

import logo from './logo.svg';
import { TopBar, TopBarLeft, Menu, MenuItem, TopBarRight } from 'react-foundation';

class Header extends React.Component {
    public render() {
        return (
            <header>

                <TopBar>
                    <TopBarLeft>
                        <Menu>
                            <MenuItem><a>Menu 1</a></MenuItem>
                            <MenuItem><a>Menu 2</a></MenuItem>
                        </Menu>
                    </TopBarLeft>
                    <TopBarRight>
                        <img src={logo} className="App-logo" alt="logo" />
                    </TopBarRight>
                </TopBar>

                <br />

            </header>
        );
    }
}

export default Header;
