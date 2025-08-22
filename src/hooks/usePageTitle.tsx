import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTitle = (title?: string) => {
  const location = useLocation();

  useEffect(() => {
    if (title) {
      document.title = title;
    } else {
      // Set default title based on route
      const path = location.pathname;
      
      if (path.startsWith('/community/nations')) {
        document.title = 'Nations - Nordics World';
      } else if (path.startsWith('/community/towns')) {
        document.title = 'Towns - Nordics World';
      } else if (path.startsWith('/community/players')) {
        document.title = 'Players - Nordics World';
      } else if (path.startsWith('/community')) {
        document.title = 'Community - Nordics World';
      } else if (path.startsWith('/towns/nations')) {
        document.title = 'Nations - Nordics World';
      } else if (path.startsWith('/towns/towns')) {
        document.title = 'Towns - Nordics World';
      } else if (path.startsWith('/towns')) {
        document.title = 'Towns - Nordics World';
      } else if (path.startsWith('/nation/')) {
        const nationName = path.split('/')[2]?.replace(/_/g, ' ') || 'Nation';
        document.title = `${nationName} - Nordics World`;
      } else if (path.startsWith('/town/')) {
        const townName = path.split('/')[2]?.replace(/_/g, ' ') || 'Town';
        document.title = `${townName} - Nordics World`;
      } else if (path.startsWith('/player/')) {
        const playerName = path.split('/')[2] || 'Player';
        document.title = `${playerName} - Nordics World`;
      } else if (path.startsWith('/company/')) {
        const companyName = path.split('/')[2]?.replace(/_/g, ' ') || 'Company';
        document.title = `${companyName} - Nordics World`;
      } else if (path.startsWith('/shop/')) {
        document.title = 'Shop - Nordics World';
      } else if (path.startsWith('/forum')) {
        document.title = 'Forum - Nordics World';
      } else if (path.startsWith('/wiki')) {
        document.title = 'Wiki - Nordics World';
      } else if (path.startsWith('/map')) {
        document.title = 'Map - Nordics World';
      } else if (path.startsWith('/economy')) {
        document.title = 'Economy - Nordics World';
      } else if (path.startsWith('/markets')) {
        document.title = 'Markets - Nordics World';
      } else if (path.startsWith('/admin')) {
        document.title = 'Admin - Nordics World';
      } else if (path === '/') {
        document.title = 'Nordics World';
      } else if (path === '/home') {
        document.title = 'Home - Nordics World';
      } else if (path === '/nyrvalos') {
        document.title = 'Nyrvalos - Nordics World';
      } else if (path === '/login') {
        document.title = 'Login - Nordics World';
      } else if (path === '/signup') {
        document.title = 'Sign Up - Nordics World';
      } else if (path === '/dashboard') {
        document.title = 'Dashboard - Nordics World';
      } else if (path === '/rules') {
        document.title = 'Rules - Nordics World';
      } else if (path === '/contact') {
        document.title = 'Contact - Nordics World';
      } else if (path === '/messages') {
        document.title = 'Messages - Nordics World';
      } else if (path === '/guide') {
        document.title = 'Guide - Nordics World';
      } else if (path === '/store') {
        document.title = 'Store - Nordics World';
      } else if (path === '/nsi') {
        document.title = 'NSI - Nordics World';
      } else {
        document.title = 'Nordics World';
      }
    }
  }, [location.pathname, title]);

  return null;
};
