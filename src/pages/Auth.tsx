import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Lock, User, UserPlus, Fingerprint } from 'lucide-react';

const Auth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Using username@placeholder.com as email since Supabase Auth requires email
        // A better approach would be to use a custom table for username-to-email mapping
        // But for simplicity as requested (Name, Username, Password), we'll use this trick.
        const placeholderEmail = `${username.toLowerCase()}@frictionless.app`;

        try {
            const { data, error } = await supabase.auth.signUp({
                email: placeholderEmail,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                toast.success('Account created! Welcome to Frictionless Focus.');
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const placeholderEmail = `${username.toLowerCase()}@frictionless.app`;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: placeholderEmail,
                password,
            });

            if (error) throw error;

            if (data.user) {
                toast.success('Welcome back!');
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,184,255,0.1),transparent_50%)] pointer-events-none" />

            <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />

                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
                        <Fingerprint className="w-8 h-8 text-neon" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white font-mono uppercase">
                        Frictionless Focus
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                        Master your flow
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/50 border border-border">
                            <TabsTrigger value="login" className="data-[state=active]:bg-primary/20 data-[state=active]:text-neon">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20 data-[state=active]:text-neon">Join</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-username" className="text-xs font-mono uppercase text-muted-foreground">Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-username"
                                            placeholder="Your username"
                                            className="pl-10 bg-background/50 border-border focus:border-neon transition-colors"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="text-xs font-mono uppercase text-muted-foreground">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 bg-background/50 border-border focus:border-neon transition-colors"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-6 font-mono uppercase tracking-widest"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Decrypting...' : 'Enter Focus'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full-name" className="text-xs font-mono uppercase text-muted-foreground">Full Name</Label>
                                    <div className="relative">
                                        <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="full-name"
                                            placeholder="John Doe"
                                            className="pl-10 bg-background/50 border-border focus:border-neon transition-colors"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-username" className="text-xs font-mono uppercase text-muted-foreground">Choose Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="signup-username"
                                            placeholder="username"
                                            className="pl-10 bg-background/50 border-border focus:border-neon transition-colors"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="text-xs font-mono uppercase text-muted-foreground">Create Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 bg-background/50 border-border focus:border-neon transition-colors"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-6 font-mono uppercase tracking-widest"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating Identity...' : 'Initiate Protocol'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-border/30 pt-4 mt-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
                        System status: Secure & Operational
                    </p>
                </CardFooter>
            </Card>

            <div className="fixed bottom-4 right-4 text-[10px] font-mono text-muted-foreground/30 select-none">
                v1.0.0-PROD
            </div>
        </div>
    );
};

export default Auth;
