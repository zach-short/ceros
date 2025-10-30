'use client';

import { useMemo, useState } from 'react';
import { PanelLeft } from 'lucide-react';
import {
  apiDocumentation,
  type ApiRoute,
  type HttpMethod,
  type Parameter,
  type RequestBodyField,
  type ResponseExample,
} from './api-data';

const methodColors: Record<HttpMethod, string> = {
  GET: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  POST: 'text-green-500 bg-green-500/10 border-green-500/20',
  PUT: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  PATCH: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  DELETE: 'text-red-500 bg-red-500/10 border-red-500/20',
};

interface RouteCardProps {
  route: ApiRoute;
  onClick: () => void;
}

function RouteCard({ route, onClick }: RouteCardProps) {
  return (
    <button
      onClick={onClick}
      className='flex items-center space-x-3 py-2 w-full hover:bg-neutral-800 rounded px-2 transition-colors cursor-pointer'
    >
      <span
        className={`px-2 py-1 text-xs font-semibold rounded border flex-shrink-0 w-16 text-center ${
          methodColors[route.method]
        }`}
      >
        {route.method}
      </span>
      <span className='font-mono text-xs text-neutral-300 break-all'>
        {route.path}
      </span>
    </button>
  );
}

interface ParameterTableProps {
  title: string;
  fields: Parameter[] | RequestBodyField[];
}

function ParameterTable({ title, fields }: ParameterTableProps) {
  return (
    <div className='mb-6'>
      <h4 className='text-sm font-semibold text-white mb-3'>{title}</h4>
      <div className='bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto'>
        <table className='w-full min-w-max'>
          <thead className='bg-neutral-800/50'>
            <tr>
              <th className='text-left px-4 py-2 text-xs font-semibold text-neutral-400 uppercase'>
                {title === 'Parameters' ? 'Name' : 'Field'}
              </th>
              <th className='text-left px-4 py-2 text-xs font-semibold text-neutral-400 uppercase'>
                Type
              </th>
              <th className='text-left px-4 py-2 text-xs font-semibold text-neutral-400 uppercase'>
                Description
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-800'>
            {fields.map((field, index) => (
              <tr key={index}>
                <td className='px-4 py-3'>
                  <code className='text-sm text-blue-400'>{field.name}</code>
                  {field.required && (
                    <span className='ml-2 text-xs text-red-400'>required</span>
                  )}
                </td>
                <td className='px-4 py-3'>
                  <code className='text-sm text-neutral-400'>{field.type}</code>
                </td>
                <td className='px-4 py-3 text-sm text-neutral-400'>
                  {field.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ResponseSectionProps {
  response: ResponseExample;
}

function ResponseSection({ response }: ResponseSectionProps) {
  return (
    <div>
      <h4 className='text-sm font-semibold text-white mb-3'>Response</h4>
      <div className='bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden'>
        <div className='px-4 py-2 bg-neutral-800/50 border-b border-neutral-800'>
          <span className='text-xs text-neutral-400'>
            Status: <span className='text-green-400'>{response.status}</span>
          </span>
        </div>
        <pre className='p-4 overflow-x-auto max-w-full'>
          <code className='text-sm text-green-400'>{response.body}</code>
        </pre>
      </div>
    </div>
  );
}

interface RouteDetailsProps {
  route: ApiRoute;
  routeId: string;
}

function RouteDetails({ route, routeId }: RouteDetailsProps) {
  return (
    <div id={routeId} className='border-t border-neutral-800 pt-8 scroll-mt-8'>
      <div className='mb-6'>
        <div className='flex items-center space-x-3 mb-2 flex-wrap'>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded border w-16 text-center ${
              methodColors[route.method]
            }`}
          >
            {route.method}
          </span>
          <h3 className='font-mono text-sm lg:text-lg text-white break-all'>
            {route.path}
          </h3>
        </div>
        <p className='text-neutral-400'>{route.description}</p>
        {route.requiresAuth && (
          <div className='mt-2'>
            <span className='inline-flex items-center px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded border border-purple-500/20'>
              Requires Authentication
            </span>
          </div>
        )}
      </div>

      {route.parameters && route.parameters.length > 0 && (
        <ParameterTable title='Parameters' fields={route.parameters} />
      )}

      {route.requestBody && route.requestBody.length > 0 && (
        <ParameterTable title='Request Body' fields={route.requestBody} />
      )}

      {route.response && <ResponseSection response={route.response} />}
    </div>
  );
}

interface PathGroupSectionProps {
  routes: ApiRoute[];
  scrollToRoute: (route: ApiRoute) => void;
}

function PathGroupSection({ routes, scrollToRoute }: PathGroupSectionProps) {
  return (
    <div className='space-y-2'>
      {routes.map((route, index) => (
        <RouteCard
          key={index}
          route={route}
          onClick={() => scrollToRoute(route)}
        />
      ))}
    </div>
  );
}

interface PathGroupDetailsSectionProps {
  path: string;
  routes: ApiRoute[];
  getRouteId: (route: ApiRoute) => string;
}

function PathGroupDetailsSection({
  routes,
  getRouteId,
}: PathGroupDetailsSectionProps) {
  return (
    <div>
      <div className='space-y-12'>
        {routes.map((route, index) => (
          <RouteDetails key={index} route={route} routeId={getRouteId(route)} />
        ))}
      </div>
    </div>
  );
}

export default function ApiDocs() {
  const [selectedSection, setSelectedSection] = useState<string>(
    apiDocumentation[0].title,
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const currentSection = apiDocumentation.find(
    (section) => section.title === selectedSection,
  );

  const groupedRoutes = useMemo(() => {
    if (!currentSection) return [];

    const methodOrder: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const grouped = currentSection.routes.reduce(
      (acc, route) => {
        if (!acc[route.path]) {
          acc[route.path] = [];
        }
        acc[route.path].push(route);
        return acc;
      },
      {} as Record<string, ApiRoute[]>,
    );

    return Object.entries(grouped)
      .map(([path, routes]) => ({
        path,
        routes: routes.sort(
          (a, b) =>
            methodOrder.indexOf(a.method) - methodOrder.indexOf(b.method),
        ),
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [currentSection]);

  const getRouteId = (route: ApiRoute) => {
    return `${route.method.toLowerCase()}-${route.path.replace(/[/:]/g, '-')}`;
  };

  const scrollToRoute = (route: ApiRoute) => {
    const element = document.getElementById(getRouteId(route));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSectionChange = (sectionTitle: string) => {
    setSelectedSection(sectionTitle);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='min-h-screen bg-neutral-950 overflow-x-hidden'>
      <div className='flex relative w-full'>
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`w-64 max-w-[80vw] h-screen bg-neutral-900 border-r border-neutral-800 fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-semibold text-neutral-400 uppercase tracking-wider'>
                API Reference
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className='lg:hidden text-neutral-400 hover:text-white'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <nav className='space-y-1'>
              {apiDocumentation.map((section) => (
                <button
                  key={section.title}
                  onClick={() => handleSectionChange(section.title)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedSection === section.title
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className='lg:ml-64 flex-1 w-full max-w-full'>
          <div className='max-w-4xl px-4 py-4 lg:p-8 mx-auto'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='lg:hidden fixed top-4 left-4 z-30 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white'
            >
              <PanelLeft className='w-6 h-6' />
            </button>

            <div className='mb-8 pt-16 lg:pt-0'>
              <h1 className='text-3xl font-bold text-white mb-2'>
                {currentSection?.title}
              </h1>
              <p className='text-neutral-400'>{currentSection?.description}</p>
            </div>

            <div className='mb-8'>
              <h2 className='text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4'>
                Endpoints
              </h2>
              <div className='bg-neutral-900 rounded-lg p-1 border border-neutral-800'>
                <div className='space-y-2'>
                  {groupedRoutes.map((group) => (
                    <PathGroupSection
                      key={group.path}
                      routes={group.routes}
                      scrollToRoute={scrollToRoute}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='space-y-16'>
              {groupedRoutes.map((group) => (
                <PathGroupDetailsSection
                  key={group.path}
                  path={group.path}
                  routes={group.routes}
                  getRouteId={getRouteId}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
