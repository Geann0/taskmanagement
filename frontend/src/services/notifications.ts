// Browser Push Notifications Helper

export type NotificationType =
  | 'card_assigned'
  | 'card_updated'
  | 'card_commented'
  | 'card_moved'
  | 'member_added';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  show(options: NotificationOptions): void {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo192.png',
      tag: options.tag,
      data: options.data,
      badge: '/logo192.png',
    });

    notification.onclick = () => {
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // Predefined notification templates
  cardAssigned(cardTitle: string, projectId: string): void {
    this.show({
      title: '📋 New Card Assigned',
      body: `You've been assigned to: ${cardTitle}`,
      tag: 'card-assigned',
      data: { url: `/projects/${projectId}` },
    });
  }

  cardUpdated(cardTitle: string, projectId: string): void {
    this.show({
      title: '✏️ Card Updated',
      body: `"${cardTitle}" has been updated`,
      tag: 'card-updated',
      data: { url: `/projects/${projectId}` },
    });
  }

  cardCommented(cardTitle: string, commenterName: string, projectId: string): void {
    this.show({
      title: '💬 New Comment',
      body: `${commenterName} commented on "${cardTitle}"`,
      tag: 'card-commented',
      data: { url: `/projects/${projectId}` },
    });
  }

  cardMoved(cardTitle: string, newColumn: string, projectId: string): void {
    this.show({
      title: '🔄 Card Moved',
      body: `"${cardTitle}" moved to ${newColumn}`,
      tag: 'card-moved',
      data: { url: `/projects/${projectId}` },
    });
  }

  memberAdded(projectName: string, projectId: string): void {
    this.show({
      title: '👥 Added to Project',
      body: `You've been added to "${projectName}"`,
      tag: 'member-added',
      data: { url: `/projects/${projectId}` },
    });
  }
}

export const notificationService = new NotificationService();
