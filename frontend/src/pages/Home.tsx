import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Manage all your properties, units, and tenant information in one place'
    },
    {
      icon: Users,
      title: 'Tenant Portal',
      description: 'Provide tenants with self-service options for rent payments and maintenance requests'
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Track income, expenses, and profitability with detailed reports and charts'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and audit trails'
    },
    {
      icon: Clock,
      title: 'Time Saving',
      description: 'Automate rent collection, maintenance scheduling, and tenant communications'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your property management tools from anywhere on any device'
    }
  ]

  const benefits = [
    'Increase rental income by 15-25%',
    'Reduce vacancy time by 30%',
    'Save 10+ hours per week on admin tasks',
    'Improve tenant satisfaction scores',
    'Streamline maintenance processes',
    'Generate professional reports instantly'
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Professional Property Management Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your property management with our comprehensive platform. 
              Manage tenants, track finances, handle maintenance requests, and grow your rental business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/auth/register"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started Free
              </Link>
              <Link
                to="/auth/login"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Sign In <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Everything You Need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Complete Property Management Solution
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From tenant screening to rent collection, our platform handles every aspect 
              of property management so you can focus on growing your business.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {feature.title}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">
                      {feature.description}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Property Owners Choose Us
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join thousands of property owners who have transformed their rental business 
              with our powerful management platform.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your property management?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Start your free trial today and experience the power of professional 
              property management software.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/auth/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start Free Trial
              </Link>
              <Link
                to="/auth/login"
                className="text-sm font-semibold leading-6 text-white flex items-center"
              >
                Sign in to your account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home