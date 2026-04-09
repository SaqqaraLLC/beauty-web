'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Campaign {
  campaignId: number;
  title: string;
  subject: string;
  status: string;
  channel: string;
  createdAt: string;
  sentAt: string | null;
  recipientCount: number;
}

interface PendingUser {
  id: string;
  email: string;
  status: string;
  role?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'broadcasts' | 'users' | 'moderation'>('overview');
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Load broadcasts
      const campaignsRes = await fetch(`${API_URL}/api/broadcasts/campaigns`, {
        credentials: 'include'
      });
      
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data || []);
      }

      // Load pending users
      const usersRes = await fetch(`${API_URL}/admin/pending-users`, {
        credentials: 'include'
      });

      if (usersRes.ok) {
        const data = await usersRes.json();
        setPendingUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(userId: string) {
    try {
      const res = await fetch(`${API_URL}/admin/approve/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      }
    } catch (err) {
      setError('Failed to approve user');
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Draft': 'badge-info',
      'Scheduled': 'badge-warning',
      'Sent': 'badge-success',
      'Failed': 'badge-danger'
    };
    return statusMap[status] || 'badge-info';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="rounded-3xl border border-saqqara-border bg-saqqara-card/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <h1 className="text-xl font-cinzel mb-1">Admin Dashboard</h1>
            <p className="text-saqqara-light/60 text-sm">Manage broadcasts, users, and platform operations</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-saqqara-border pb-4 mb-10">
            {(['overview', 'broadcasts', 'users', 'moderation'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-saqqara-gold border-b-2 border-saqqara-gold'
                    : 'text-saqqara-light/60 hover:text-saqqara-light'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-saqqara-light/60">Loading...</p>
            </div>
          ) : activeTab === 'overview' ? (
            <OverviewTab campaigns={campaigns} pendingUsers={pendingUsers} />
          ) : activeTab === 'broadcasts' ? (
            <BroadcastsTab 
              campaigns={campaigns} 
              onNewCampaign={() => setShowNewCampaign(true)}
              statusBadge={getStatusBadge}
            />
          ) : activeTab === 'users' ? (
            <UsersTab 
              pendingUsers={pendingUsers} 
              onApprove={approveUser}
            />
          ) : (
            <ModerationTab />
          )}
        </div>
      </div>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ campaigns, pendingUsers }: { campaigns: Campaign[], pendingUsers: PendingUser[] }) {
  const sentCampaigns = campaigns.filter(c => c.status === 'Sent').length;
  const scheduledCampaigns = campaigns.filter(c => c.status === 'Scheduled').length;
  const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0);

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-10">
      <div className="card p-8">
        <div className="text-xl font-bold text-saqqara-gold mb-1">{campaigns.length}</div>
        <p className="text-saqqara-light/60">Total Campaigns</p>
      </div>
      <div className="card p-8">
        <div className="text-xl font-bold text-saqqara-gold mb-1">{sentCampaigns}</div>
        <p className="text-saqqara-light/60">Sent This Month</p>
      </div>
      <div className="card p-8">
        <div className="text-xl font-bold text-saqqara-gold mb-1">{scheduledCampaigns}</div>
        <p className="text-saqqara-light/60">Scheduled</p>
      </div>
      <div className="card p-8">
        <div className="text-xl font-bold text-saqqara-gold mb-1">{pendingUsers.length}</div>
        <p className="text-saqqara-light/60">Pending Approvals</p>
      </div>
      <div className="card p-8">
        <div className="text-xl font-bold text-saqqara-gold mb-1">{totalRecipients}</div>
        <p className="text-saqqara-light/60">Total Recipients</p>
      </div>
    </div>
  );
}

// Broadcasts Tab Component
function BroadcastsTab({ 
  campaigns, 
  onNewCampaign, 
  statusBadge 
}: { 
  campaigns: Campaign[], 
  onNewCampaign: () => void,
  statusBadge: (status: string) => string
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-base font-cinzel">Broadcast Campaigns</h2>
        <button onClick={onNewCampaign} className="btn btn-primary">
          + New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card text-center py-12 px-8">
          <p className="text-saqqara-light/60 mb-4">No campaigns yet</p>
          <button onClick={onNewCampaign} className="btn btn-primary">
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {campaigns.map(campaign => (
            <div key={campaign.campaignId} className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{campaign.title}</h3>
                <p className="text-saqqara-light/60 text-sm mb-2">{campaign.subject}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-saqqara-light/60">
                    Channel: <span className="text-saqqara-light">{campaign.channel}</span>
                  </span>
                  <span className="text-saqqara-light/60">
                    Recipients: <span className="text-saqqara-light">{campaign.recipientCount}</span>
                  </span>
                  <span className="text-saqqara-light/60">
                    Created: <span className="text-saqqara-light">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${statusBadge(campaign.status)}`}>
                  {campaign.status}
                </span>
                <Link href={`/dashboard/broadcasts/${campaign.campaignId}`}>
                  <button className="btn btn-secondary text-sm">View</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Users Tab Component
function UsersTab({ 
  pendingUsers, 
  onApprove 
}: { 
  pendingUsers: PendingUser[], 
  onApprove: (id: string) => void
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-base font-cinzel mb-6">Pending User Approvals</h2>

      {pendingUsers.length === 0 ? (
        <div className="card text-center py-12 px-8">
          <p className="text-saqqara-light/60">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingUsers.map(user => (
            <div key={user.id} className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-saqqara-light/60 text-sm">Role: {user.role || 'Not assigned'}</p>
              </div>
              <button
                onClick={() => onApprove(user.id)}
                className="btn btn-primary text-sm"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Moderation Tab Component
function ModerationTab() {
  return (
    <div>
      <h2 className="text-base font-cinzel mb-6">Content Moderation</h2>
      <p className="text-saqqara-light/60 mb-6">
        Review and manage flagged content from artist streams
      </p>

      <Link href="/dashboard/moderation">
        <button className="btn btn-primary mb-6">
          📋 Go to Moderation Center
        </button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-saqqara-gold">⚠️ What Gets Flagged</h3>
          <ul className="space-y-2 text-saqqara-light/80 text-sm">
            <li>• Inappropriate content (adult, violence, harassment)</li>
            <li>• Illegal activities or spam</li>
            <li>• Hate speech or discriminatory language</li>
            <li>• Misinformation or false claims</li>
            <li>• Copyright violations</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-saqqara-gold">✓ Actions Available</h3>
          <ul className="space-y-2 text-saqqara-light/80 text-sm">
            <li>• Approve flagged content (false positive)</li>
            <li>• Remove content from platform</li>
            <li>• Ban artist from platform</li>
            <li>• Mark as reviewed for record keeping</li>
            <li>• Track moderation history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
