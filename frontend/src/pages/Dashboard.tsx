import React, { useState } from 'react';
import Header from '../components/Header';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject } from '../hooks/useApi';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
  });

  // Use TanStack Query
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const createProjectMutation = useCreateProject();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProjectMutation.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', visibility: 'private' });
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoadingProjects) {
    return (
      <div>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <NotificationPermissionBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h2>
            <p className="text-gray-600 mt-2">
              Manage your projects and collaborate with your team
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
              <p className="text-gray-600 mt-2">Create your first project to get started</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Project
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                <div className="mt-4 flex gap-2">
                  {project.members &&
                    project.members.slice(0, 3).map((member, index) => {
                      const userId =
                        typeof member.userId === 'string'
                          ? member.userId
                          : member.userId?.toString() || '';
                      const initial = userId.charAt(0).toUpperCase() || '?';
                      return (
                        <div
                          key={index}
                          className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                        >
                          {initial}
                        </div>
                      );
                    })}
                  {project.members && project.members.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Criar Projeto */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Project</h3>
                <form onSubmit={handleCreateProject}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="My Awesome Project"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What is this project about?"
                      rows={3}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setFormData({ name: '', description: '', visibility: 'private' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      disabled={createProjectMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
