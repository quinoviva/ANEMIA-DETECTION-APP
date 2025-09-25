import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Home, 
  Camera, 
  User, 
  FileText, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Route } from './Router';

interface NavigationProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    { route: 'home' as Route, label: 'Home', icon: Home },
    { route: 'analysis' as Route, label: 'Analysis', icon: Camera },
    { route: 'results' as Route, label: 'Results', icon: FileText },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNavigation = (route: Route) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleNavigation('home')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Anemia Detection</span>
              </motion.div>

              {/* Desktop Navigation Items */}
              <div className="hidden md:flex items-center space-x-4">
                {navigationItems.map(({ route, label, icon: Icon }) => (
                  <Button
                    key={route}
                    variant={currentRoute === route ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavigation(route)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center space-x-2"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback>
                            {user.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block">{user.displayName}</span>
                        {user.isGuest && (
                          <Badge variant="secondary" className="text-xs">
                            Guest
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleNavigation('profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('results')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Results History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={() => handleNavigation('auth')}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Sign In
                  </Button>
                )}

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-40 md:hidden"
        >
          <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map(({ route, label, icon: Icon }) => (
                <Button
                  key={route}
                  variant={currentRoute === route ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation(route)}
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  );
};