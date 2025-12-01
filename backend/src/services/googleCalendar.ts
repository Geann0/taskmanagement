import { google } from 'googleapis';

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

export class GoogleCalendarService {
  private calendar;

  constructor(accessToken?: string, refreshToken?: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    if (accessToken && refreshToken) {
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Cria um evento no Google Calendar
   */
  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Atualiza um evento existente no Google Calendar
   */
  async updateEvent(eventId: string, event: CalendarEvent): Promise<void> {
    try {
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Deleta um evento do Google Calendar
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Lista eventos do Google Calendar
   */
  async listEvents(maxResults = 10): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw new Error('Failed to list calendar events');
    }
  }
}
