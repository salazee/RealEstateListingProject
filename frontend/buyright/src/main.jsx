import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import{StrictMode} from 'react'
import './index.css'
import App from './App.jsx'
import {Toaster} from'react-hot-toast'
import React from 'react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
       <App />
       <Toaster position ="top-right" />
    </BrowserRouter>
  </StrictMode>,
)
