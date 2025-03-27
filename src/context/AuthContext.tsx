import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'admin';

export type MembershipStatus = 'pending' | 'approved' | 'blocked';

export type MembershipPurpose = 
  | 'buy' 
  | 'sell' 
  | 'rent' 
  | 'collaborate' 
  | 'curious';

export type User = {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  phoneNumber?: string;
  role: UserRole;
  status: MembershipStatus;
  purpose?: MembershipPurpose;
  createdAt: Date;
} | null;

export interface BaseListing {
  id: number;
  title: string;
  type: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  featured: boolean;
}

export interface PropertyListing extends BaseListing {
  bedrooms: number;
  bathrooms: number;
  area: number;
  plotArea?: number;
  category: string;
}

export interface LeisureListing extends BaseListing {
  duration: string;
  available: string;
  features: string;
  category: string;
}

export type Listing = PropertyListing | LeisureListing;

export type ListingType = 'portfolio' | 'justArrived' | 'leisure';

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUser: (updatedUser: Partial<Omit<User, 'id' | 'email'>>) => void;
  getAllUsers: () => User[];
  updateUserById: (userId: string, userData: Partial<Omit<User, 'id' | 'email'>>) => void;
  addUser: (newUser: Omit<User, 'id' | 'createdAt'> & { password: string }) => User;
  getAllPortfolioListings: () => PropertyListing[];
  getAllJustArrivedListings: () => PropertyListing[];
  getAllLeisureListings: () => LeisureListing[];
  getFeaturedPortfolioListings: () => PropertyListing[];
  getFeaturedJustArrivedListings: () => PropertyListing[];
  getFeaturedLeisureListings: () => LeisureListing[];
  saveListing: (listingType: ListingType, id: number | null, listing: Listing) => number;
  deleteListing: (listingType: ListingType, id: number) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(),
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  updateUser: () => {},
  getAllUsers: () => [],
  updateUserById: () => {},
  addUser: () => null,
  getAllPortfolioListings: () => [],
  getAllJustArrivedListings: () => [],
  getAllLeisureListings: () => [],
  getFeaturedPortfolioListings: () => [],
  getFeaturedJustArrivedListings: () => [],
  getFeaturedLeisureListings: () => [],
  saveListing: () => 0,
  deleteListing: () => {},
});

const ADMIN_EMAIL = 'info@businessunit.club';
const ADMIN_PASSWORD = '1234';

const DEMO_EMAIL = 'demo@demo.com';
const DEMO_PASSWORD = '1234';

const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    email: ADMIN_EMAIL,
    name: 'Admin User',
    fullName: 'Administrator',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'demo1',
    email: DEMO_EMAIL,
    name: 'Demo',
    fullName: 'Demo User',
    phoneNumber: '+34600777888',
    role: 'user',
    status: 'approved',
    purpose: 'buy',
    createdAt: new Date('2023-05-10')
  },
  {
    id: 'user1',
    email: 'john@example.com',
    name: 'John',
    fullName: 'John Doe',
    phoneNumber: '+34600123456',
    role: 'user',
    status: 'pending',
    purpose: 'buy',
    createdAt: new Date('2023-06-15')
  },
  {
    id: 'user2',
    email: 'alice@example.com',
    name: 'Alice',
    fullName: 'Alice Smith',
    phoneNumber: '+34600654321',
    role: 'user',
    status: 'approved',
    purpose: 'sell',
    createdAt: new Date('2023-07-20')
  },
  {
    id: 'user3',
    email: 'bob@example.com',
    name: 'Bob',
    fullName: 'Bob Johnson',
    phoneNumber: '+34601234567',
    role: 'user',
    status: 'blocked',
    purpose: 'rent',
    createdAt: new Date('2023-08-05')
  }
];

const INITIAL_PORTFOLIO_LISTINGS: PropertyListing[] = [
  {
    id: 1,
    title: "Luxury Sea-View Villa",
    type: "longterm",
    location: "Port d'Andratx",
    price: 4800,
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    plotArea: 1200,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "longterm",
    featured: true
  },
  {
    id: 2,
    title: "Beachfront Modern Apartment",
    type: "shortterm",
    location: "Palma",
    price: 1900,
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "shortterm",
    featured: true
  },
  {
    id: 3,
    title: "Luxurious Holiday Villa",
    type: "holiday",
    location: "Costa de los Pinos",
    price: 3200,
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    plotArea: 850,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "holiday",
    featured: true
  },
  {
    id: 4,
    title: "Exclusive Penthouse",
    type: "longterm",
    location: "Puerto Portals",
    price: 5500,
    bedrooms: 3,
    bathrooms: 3,
    area: 250,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "longterm",
    featured: true
  },
  {
    id: 5,
    title: "Mountain Retreat Finca",
    type: "shortterm",
    location: "Valldemossa",
    price: 2800,
    bedrooms: 4,
    bathrooms: 3,
    area: 380,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "shortterm",
    featured: true
  },
  {
    id: 6,
    title: "Beachside Vacation Home",
    type: "holiday",
    location: "Cala d'Or",
    price: 2200,
    bedrooms: 3,
    bathrooms: 2,
    area: 210,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "holiday",
    featured: false
  },
  {
    id: 7,
    title: "Mediterranean Garden Villa",
    type: "longterm",
    location: "Santa Ponsa",
    price: 3800,
    bedrooms: 4,
    bathrooms: 4,
    area: 320,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "longterm",
    featured: false
  }
];

const INITIAL_JUST_ARRIVED_LISTINGS: PropertyListing[] = [
  {
    id: 101,
    title: "Seafront Villa with Pool",
    type: "villa",
    location: "Costa de la Calma",
    price: 5200000,
    bedrooms: 4,
    bathrooms: 5,
    area: 380,
    plotArea: 1500,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: true
  },
  {
    id: 102,
    title: "Penthouse in Port Adriano",
    type: "apartment",
    location: "Port Adriano",
    price: 2400000,
    bedrooms: 3,
    bathrooms: 3,
    area: 195,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: true
  },
  {
    id: 103,
    title: "Luxury Villa in Son Vida",
    type: "villa",
    location: "Son Vida",
    price: 7800000,
    bedrooms: 6,
    bathrooms: 7,
    area: 650,
    plotArea: 2000,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: true
  },
  {
    id: 104,
    title: "Prime Development Plot",
    type: "plot",
    location: "Santa Ponsa",
    price: 1950000,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    plotArea: 2000,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: true
  },
  {
    id: 105,
    title: "Historic Townhouse",
    type: "building",
    location: "Palma Old Town",
    price: 3200000,
    bedrooms: 5,
    bathrooms: 4,
    area: 420,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: true
  },
  {
    id: 106,
    title: "Modern Villa Project",
    type: "project",
    location: "Bendinat",
    price: 4500000,
    bedrooms: 5,
    bathrooms: 5,
    area: 500,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: false
  },
  {
    id: 107,
    title: "Exclusive Golf Course Villa",
    type: "villa",
    location: "Son Gual",
    price: 6300000,
    bedrooms: 5,
    bathrooms: 6,
    area: 550,
    plotArea: 0,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "sale",
    featured: false
  }
];

const INITIAL_LEISURE_LISTINGS: LeisureListing[] = [
  {
    id: 201,
    title: "Ferrari 488 Spider",
    type: "car",
    location: "Palma",
    price: 950,
    duration: "day",
    available: "Immediate",
    features: "550 HP, Convertible",
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: true
  },
  {
    id: 202,
    title: "Lamborghini Huracán EVO",
    type: "car",
    location: "Puerto Portals",
    price: 1200,
    duration: "day",
    available: "24h notice",
    features: "640 HP, AWD",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: true
  },
  {
    id: 203,
    title: "Sunseeker Predator 74",
    type: "yacht",
    location: "Puerto Portals",
    price: 3800,
    duration: "day",
    available: "48h notice",
    features: "74ft, 4 Cabins, Crew Included",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: true
  },
  {
    id: 204,
    title: "Porsche 911 Carrera S",
    type: "car",
    location: "Palma",
    price: 850,
    duration: "day",
    available: "Immediate",
    features: "450 HP, Sport Chrono Package",
    image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: true
  },
  {
    id: 205,
    title: "Princess V65 Yacht",
    type: "yacht",
    location: "Port Adriano",
    price: 3200,
    duration: "day",
    available: "24h notice",
    features: "65ft, 3 Cabins, Full Service",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: true
  },
  {
    id: 206,
    title: "Bentley Continental GTC",
    type: "car",
    location: "Puerto Portals",
    price: 780,
    duration: "day",
    available: "Immediate",
    features: "Convertible, Luxury Interior",
    image: "https://images.unsplash.com/photo-1580274438391-31dbed6cc672?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: false
  },
  {
    id: 207,
    title: "Azimut 50 Yacht",
    type: "yacht",
    location: "Puerto Portals",
    price: 2900,
    duration: "day",
    available: "48h notice",
    features: "50ft, 3 Cabins, Crew Included",
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "rental",
    featured: false
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [portfolioListings, setPortfolioListings] = useState<PropertyListing[]>(INITIAL_PORTFOLIO_LISTINGS);
  const [justArrivedListings, setJustArrivedListings] = useState<PropertyListing[]>(INITIAL_JUST_ARRIVED_LISTINGS);
  const [leisureListings, setLeisureListings] = useState<LeisureListing[]>(INITIAL_LEISURE_LISTINGS);

  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = users.find(u => u.email === ADMIN_EMAIL);
      if (adminUser) {
        setUser(adminUser);
        return;
      }
    }
    
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser = users.find(u => u.email === DEMO_EMAIL);
      if (demoUser) {
        setUser({...demoUser, role: 'admin'});
        return;
      }
    }
    
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      if (password === DEMO_PASSWORD) {
        if (foundUser.status === 'approved' || foundUser.role === 'admin') {
          setUser(foundUser);
        } else if (foundUser.status === 'pending') {
          throw new Error('Your account is pending approval.');
        } else if (foundUser.status === 'blocked') {
          throw new Error('Your account has been blocked. Please contact support.');
        }
      } else {
        throw new Error('Invalid password.');
      }
    } else {
      throw new Error('User not found. Please check your email or register.');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedUserData: Partial<Omit<User, 'id' | 'email'>>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);

    setUsers(prev => 
      prev.map(u => u.id === user.id ? { ...u, ...updatedUserData } : u)
    );
  };

  const getAllUsers = () => users;
  
  const updateUserById = (userId: string, userData: Partial<Omit<User, 'id' | 'email'>>) => {
    setUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, ...userData } : u)
    );
  };

  const addUser = (newUser: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      throw new Error('This email is already registered.');
    }
    
    const { password, ...userWithoutPassword } = newUser;
    const user: User = {
      ...userWithoutPassword,
      id: `user${users.length + 1}`,
      name: newUser.fullName?.split(' ')[0] || '',
      createdAt: new Date()
    };
    
    setUsers(prev => [...prev, user]);
    return user;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    updateUser,
    getAllUsers,
    updateUserById,
    addUser,
    getAllPortfolioListings: () => portfolioListings,
    getAllJustArrivedListings: () => justArrivedListings,
    getAllLeisureListings: () => leisureListings,
    getFeaturedPortfolioListings: () => portfolioListings.filter(listing => listing.featured).slice(0, 6),
    getFeaturedJustArrivedListings: () => justArrivedListings.filter(listing => listing.featured).slice(0, 6),
    getFeaturedLeisureListings: () => leisureListings.filter(listing => listing.featured).slice(0, 6),
    saveListing: (listingType: ListingType, id: number | null, listing: Listing) => {
      let newId = id;
      
      switch (listingType) {
        case 'portfolio':
          if (id === null) {
            newId = Math.max(0, ...portfolioListings.map(l => l.id)) + 1;
            const newListing = { ...listing, id: newId } as PropertyListing;
            setPortfolioListings([...portfolioListings, newListing]);
          } else {
            setPortfolioListings(portfolioListings.map(l => 
              l.id === id ? { ...listing, id } as PropertyListing : l
            ));
          }
          break;
          
        case 'justArrived':
          if (id === null) {
            newId = Math.max(100, ...justArrivedListings.map(l => l.id)) + 1;
            const newListing = { ...listing, id: newId } as PropertyListing;
            setJustArrivedListings([...justArrivedListings, newListing]);
          } else {
            setJustArrivedListings(justArrivedListings.map(l => 
              l.id === id ? { ...listing, id } as PropertyListing : l
            ));
          }
          break;
          
        case 'leisure':
          if (id === null) {
            newId = Math.max(200, ...leisureListings.map(l => l.id)) + 1;
            const newListing = { ...listing, id: newId } as LeisureListing;
            setLeisureListings([...leisureListings, newListing]);
          } else {
            setLeisureListings(leisureListings.map(l => 
              l.id === id ? { ...listing, id } as LeisureListing : l
            ));
          }
          break;
      }
      
      return newId || 0;
    },
    deleteListing: (listingType: ListingType, id: number) => {
      switch (listingType) {
        case 'portfolio':
          setPortfolioListings(portfolioListings.filter(l => l.id !== id));
          break;
        case 'justArrived':
          setJustArrivedListings(justArrivedListings.filter(l => l.id !== id));
          break;
        case 'leisure':
          setLeisureListings(leisureListings.filter(l => l.id !== id));
          break;
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AuthProvider');
  }
  
  if (!context.isAdmin) {
    throw new Error('This hook can only be used by an admin');
  }
  
  return context;
}
