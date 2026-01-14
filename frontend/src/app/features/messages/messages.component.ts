import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { Message } from '../../core/models';

interface ConversationPreview {
  other_user_id: number;
  other_user_name: string;
  other_user_photo?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  job_id?: number;
  job_title?: string;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  currentUser: PublicUser | null = null;
  conversations: ConversationPreview[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    if (this.currentUser) {
      this.loadConversations();
    }
  }

  loadConversations() {
    if (!this.currentUser) return;
    
    this.loading = true;
    this.api.getMessagesByUser(this.currentUser.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Group messages by conversation partner
          this.conversations = this.groupMessagesIntoConversations(res.data);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  groupMessagesIntoConversations(messages: Message[]): ConversationPreview[] {
    const conversationMap = new Map<number, ConversationPreview>();
    
    for (const msg of messages) {
      const otherId = msg.sender_id === this.currentUser?.user_id ? msg.receiver_id : msg.sender_id;
      
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          other_user_id: otherId,
          other_user_name: msg.sender_id === this.currentUser?.user_id 
            ? (msg.receiver_name || `User #${msg.receiver_id}`)
            : (msg.sender_name || `User #${msg.sender_id}`),
          last_message: msg.body,
          last_message_time: msg.sent_at,
          unread_count: (!msg.is_read && msg.receiver_id === this.currentUser?.user_id) ? 1 : 0,
          job_id: msg.job_id || undefined,
          job_title: msg.job_title
        });
      } else {
        const conv = conversationMap.get(otherId)!;
        if (!msg.is_read && msg.receiver_id === this.currentUser?.user_id) {
          conv.unread_count++;
        }
      }
    }
    
    return Array.from(conversationMap.values());
  }

  openConversation(userId: number) {
    this.router.navigate(['/messages', userId]);
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  truncateMessage(message: string, maxLength: number = 60): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }
}
