/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Solution {
  id: string;
  name: string;
  category: "IA" | "CRM" | "Seguridad" | "Conectividad" | "Colaboracion" | "PBX";
  description: string;
  brandAssociation?: string;
  keyBenefits: string[];
}

export interface ContactInfo {
  name: string;
  role: string;
  company: string;
  painsContext: string;
}

export interface SectorData {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  representativePains: string[];
  contacts: ContactInfo[];
}

export interface ProspectLog {
  id: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  sector: string;
  solution: string;
  emailSubject: string;
  emailBody: string;
  pains: string[];
  timestamp: string;
  tone: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
