
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Github, Linkedin, Twitter, UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-xl border-border transition-transform duration-200 ease-in-out hover:scale-[1.01] hover:shadow-2xl">
        <CardHeader className="text-center bg-card pb-6">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            About Me
          </CardTitle>
          <CardDescription>
            Get to know the creator behind this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          <div className="relative h-36 w-36 rounded-full overflow-hidden shadow-lg border-2 border-primary ring-2 ring-primary/30">
            <Image
              src="src/app/about/me.jpg"
              alt="Siddharth Sharan"
              width={200}
              height={200}
              className="object-cover"
              data-ai-hint="profile portrait" 
              priority
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Siddharth Sharan
            </h2>
            <p className="text-muted-foreground mt-1">
              Software Developer
            </p>
          </div>

          <p className="text-center text-foreground leading-relaxed max-w-md">
            I'm a passionate full-stack developer with a love for creating intuitive and impactful web applications. I enjoy exploring new technologies and building projects that solve real-world problems.
          </p>

          <div className="w-full border-t border-border pt-6 mt-4">
            <h3 className="text-lg font-semibold text-center text-foreground mb-4">Connect with Me</h3>
            <div className="flex justify-center space-x-3 sm:space-x-4">
              <Button asChild variant="outline" size="icon" className="transition-transform duration-150 hover:scale-110 active:scale-100 rounded-full">
                <Link href="https://github.com/sharan4sid" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="transition-transform duration-150 hover:scale-110 active:scale-100 rounded-full">
                <Link href="https://www.linkedin.com/in/sid4sharan/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="transition-transform duration-150 hover:scale-110 active:scale-100 rounded-full">
                <Link href="https://x.com/Sharan_4_Sid" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
