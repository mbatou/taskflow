import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ClipboardList, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            TaskFlow
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Streamline your marketing agency's workflow with our comprehensive task management system.
            Track SLAs, manage departments, and boost productivity.
          </p>
          <div className="mt-8 space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <FeatureCard
            icon={<ClipboardList className="h-8 w-8 mb-4 text-primary" />}
            title="Task Management"
            description="Create, assign, and track tasks across departments"
            features={[
              "SLA tracking and monitoring",
              "File attachments support",
              "Progress tracking"
            ]}
          />

          <FeatureCard
            icon={<Building2 className="h-8 w-8 mb-4 text-primary" />}
            title="Department Control"
            description="Organize tasks by department and roles"
            features={[
              "Department-specific views",
              "Role-based permissions",
              "Cross-department collaboration"
            ]}
          />

          <FeatureCard
            icon={<Clock className="h-8 w-8 mb-4 text-primary" />}
            title="SLA Management"
            description="Monitor and maintain service level agreements"
            features={[
              "Real-time SLA tracking",
              "Breach notifications",
              "Performance analytics"
            ]}
          />

          <FeatureCard
            icon={<Users className="h-8 w-8 mb-4 text-primary" />}
            title="Team Collaboration"
            description="Work together seamlessly across teams"
            features={[
              "Team assignments",
              "Task discussions",
              "File sharing"
            ]}
          />
        </div>
      </div>
    </main>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}

function FeatureCard({ icon, title, description, features }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        {icon}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}