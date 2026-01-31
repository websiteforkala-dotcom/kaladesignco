#!/usr/bin/env node

/**
 * Supabase Project Information Retriever
 * Uses the CLI access token to fetch project details and help with configuration
 */

const https = require('https');

class SupabaseProjectInfo {
    constructor() {
        this.accessToken = 'sbp_b87e6e8a9941a96e1b43c80d02eabf64586485d5';
        this.baseUrl = 'https://api.supabase.com/v1';
    }

    async makeRequest(endpoint) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.supabase.com',
                port: 443,
                path: `/v1${endpoint}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Kala-Design-Co-Setup/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(jsonData);
                        } else {
                            reject(new Error(`API Error: ${res.statusCode} - ${jsonData.message || data}`));
                        }
                    } catch (error) {
                        reject(new Error(`Parse Error: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request Error: ${error.message}`));
            });

            req.end();
        });
    }

    async getProjects() {
        try {
            console.log('🔍 Fetching your Supabase projects...\n');
            
            const projects = await this.makeRequest('/projects');
            
            if (!projects || projects.length === 0) {
                console.log('❌ No projects found. Please create a project first at https://supabase.com\n');
                return;
            }

            console.log(`✅ Found ${projects.length} project(s):\n`);
            
            projects.forEach((project, index) => {
                console.log(`${index + 1}. ${project.name}`);
                console.log(`   ID: ${project.id}`);
                console.log(`   Reference: ${project.ref}`);
                console.log(`   Region: ${project.region}`);
                console.log(`   Status: ${project.status}`);
                console.log(`   Created: ${new Date(project.created_at).toLocaleDateString()}`);
                console.log(`   URL: https://${project.ref}.supabase.co`);
                console.log('');
            });

            // Find the best project for Kala Design Co
            const kalaProject = projects.find(p => 
                p.name.toLowerCase().includes('kala') || 
                p.name.toLowerCase().includes('design')
            );

            if (kalaProject) {
                console.log('🎯 Recommended project for Kala Design Co:');
                this.displayProjectConfig(kalaProject);
            } else if (projects.length === 1) {
                console.log('🎯 Using your only project:');
                this.displayProjectConfig(projects[0]);
            } else {
                console.log('💡 To use a specific project, note its reference ID above.');
            }

            return projects;
        } catch (error) {
            console.error('❌ Error fetching projects:', error.message);
            
            if (error.message.includes('401')) {
                console.log('\n🔑 Authentication failed. Please check your access token.');
                console.log('   Current token: sbp_b87e6e8a9941a96e1b43c80d02eabf64586485d5');
                console.log('   You can get a new token from: https://supabase.com/dashboard/account/tokens');
            }
        }
    }

    displayProjectConfig(project) {
        console.log(`\n📋 Configuration for ${project.name}:`);
        console.log('─'.repeat(50));
        console.log(`Project URL: https://${project.ref}.supabase.co`);
        console.log(`Project Reference: ${project.ref}`);
        console.log('\n🔧 Update your database/supabase-config.js:');
        console.log(`this.supabaseUrl = 'https://${project.ref}.supabase.co';`);
        console.log('\n⚠️  You still need to get the anon key from your project dashboard:');
        console.log(`   1. Go to https://supabase.com/dashboard/project/${project.ref}/settings/api`);
        console.log('   2. Copy the "anon public" key');
        console.log('   3. Update supabase-config.js with that key');
        console.log('\n📚 Next steps:');
        console.log('   1. Run the database schema (see database/schema.sql)');
        console.log('   2. Test connection with database/config-checker.html');
        console.log('   3. Open admin panel to verify everything works');
    }

    async getProjectDetails(projectRef) {
        try {
            console.log(`🔍 Getting details for project: ${projectRef}\n`);
            
            const project = await this.makeRequest(`/projects/${projectRef}`);
            
            console.log('📊 Project Details:');
            console.log('─'.repeat(30));
            console.log(`Name: ${project.name}`);
            console.log(`Status: ${project.status}`);
            console.log(`Region: ${project.region}`);
            console.log(`Database Version: ${project.database?.version || 'Unknown'}`);
            console.log(`Created: ${new Date(project.created_at).toLocaleDateString()}`);
            
            this.displayProjectConfig(project);
            
            return project;
        } catch (error) {
            console.error('❌ Error fetching project details:', error.message);
        }
    }

    async createProject(name = 'kala-design-co') {
        try {
            console.log(`🚀 Creating new project: ${name}\n`);
            
            const projectData = {
                name: name,
                organization_id: null, // Will use default organization
                plan: 'free',
                region: 'us-east-1' // Default region
            };

            const project = await this.makeRequest('/projects', 'POST', projectData);
            
            console.log('✅ Project created successfully!');
            this.displayProjectConfig(project);
            
            return project;
        } catch (error) {
            console.error('❌ Error creating project:', error.message);
            console.log('\n💡 You can create a project manually at https://supabase.com/dashboard');
        }
    }

    displayHelp() {
        console.log('🔧 Supabase Project Information Tool');
        console.log('═'.repeat(40));
        console.log('\nUsage:');
        console.log('  node get-project-info.js [command] [options]');
        console.log('\nCommands:');
        console.log('  list                    List all your projects');
        console.log('  details <project-ref>   Get details for specific project');
        console.log('  create [name]          Create new project (default: kala-design-co)');
        console.log('  help                   Show this help');
        console.log('\nExamples:');
        console.log('  node get-project-info.js list');
        console.log('  node get-project-info.js details abcdefghijklmnop');
        console.log('  node get-project-info.js create kala-design-co');
        console.log('\n🔑 Access Token: sbp_b87e6e8a9941a96e1b43c80d02eabf64586485d5');
    }
}

// CLI Interface
async function main() {
    const tool = new SupabaseProjectInfo();
    const args = process.argv.slice(2);
    const command = args[0] || 'list';

    switch (command) {
        case 'list':
            await tool.getProjects();
            break;
        
        case 'details':
            const projectRef = args[1];
            if (!projectRef) {
                console.log('❌ Please provide a project reference ID');
                console.log('Usage: node get-project-info.js details <project-ref>');
                return;
            }
            await tool.getProjectDetails(projectRef);
            break;
        
        case 'create':
            const projectName = args[1] || 'kala-design-co';
            await tool.createProject(projectName);
            break;
        
        case 'help':
        case '--help':
        case '-h':
            tool.displayHelp();
            break;
        
        default:
            console.log(`❌ Unknown command: ${command}`);
            tool.displayHelp();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Unexpected error:', error.message);
        process.exit(1);
    });
}

module.exports = SupabaseProjectInfo;