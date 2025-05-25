/*
 / My-Informatics-Journal - A project from Informatics class on 05/09/2025
 / Copyright (C) 2025 ChosenSoul
 /
 / This program is free software: you can redistribute it and/or modify
 / it under the terms of the GNU General Public License as published by
 / the Free Software Foundation, either version 3 of the License, or
 / (at your option) any later version.

 / This program is distributed in the hope that it will be useful,
 / but WITHOUT ANY WARRANTY; without even the implied warranty of
 / MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 / GNU General Public License for more details.

 / You should have received a copy of the GNU General Public License
 / along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import React from 'react';
import './Loading.css';

const Loading: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="loader4"></div>
      <div className="loading-text-container">
        <span className="loading-text">З</span>
        <span className="loading-text">а</span>
        <span className="loading-text">в</span>
        <span className="loading-text">а</span>
        <span className="loading-text">н</span>
        <span className="loading-text">т</span>
        <span className="loading-text">а</span>
        <span className="loading-text">ж</span>
        <span className="loading-text">е</span>
        <span className="loading-text">н</span>
        <span className="loading-text">н</span>
        <span className="loading-text">я</span>
        <span className="loading-text">.</span>
        <span className="loading-text">.</span>
        <span className="loading-text">.</span>
      </div>
    </div>
  );
};

export default Loading;