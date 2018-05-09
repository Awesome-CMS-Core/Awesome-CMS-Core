﻿using Autofac;
using Autofac.Extensions.DependencyInjection;
using AwesomeCMSCore.Infrastructure.Config;
using AwesomeCMSCore.Infrastructure.Module;
using AwesomeCMSCore.Modules.Entities.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using Microsoft.AspNetCore.Identity;
using AspNet.Security.OpenIdConnect.Primitives;
using AspNetCore.IServiceCollection.AddIUrlHelper;
using AutoMapper;
using AwesomeCMSCore.Modules.Account.Repositories;
using AwesomeCMSCore.Modules.Admin.Repositories;
using AwesomeCMSCore.Modules.Entities.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.ResponseCompression;
using AwesomeCMSCore.Modules.Email;
using AwesomeCMSCore.Modules.Helper.ExceptionHandler;
using AwesomeCMSCore.Modules.Helper.Services;
using AwesomeCMSCore.Modules.Repositories;
using Microsoft.AspNetCore.Http;
using AwesomeCMSCore.Modules.Queue;
using Microsoft.IdentityModel.Tokens;
using AwesomeCMSCore.Modules.Mapper;
using AwesomeCMSCore.Modules.Helper.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.Versioning;
using Swashbuckle.AspNetCore.Swagger;

namespace AwesomeCMSCore.Extension
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection LoadInstalledModules(this IServiceCollection services, string contentRootPath)
        {
            var modules = new List<ModuleInfo>();
            var moduleRootFolder = new DirectoryInfo(Path.Combine(contentRootPath, "Modules"));
            var moduleFolders = moduleRootFolder.GetDirectories();

            foreach (var moduleFolder in moduleFolders)
            {
                var binFolder = new DirectoryInfo(Path.Combine(moduleFolder.FullName, "bin"));
                if (!binFolder.Exists)
                {
                    continue;
                }

                foreach (var file in binFolder.GetFileSystemInfos("*.dll", SearchOption.AllDirectories))
                {
                    Assembly assembly;
                    try
                    {
                        assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(file.FullName);
                    }
                    catch (FileLoadException)
                    {
                        // Get loaded assembly
                        assembly = Assembly.Load(new AssemblyName(Path.GetFileNameWithoutExtension(file.Name)));
                        if (assembly == null)
                        {
                            throw;
                        }
                    }

                    //add to globalconfiguration module
                    if (assembly.FullName.Contains(moduleFolder.Name))
                    {
                        modules.Add(new ModuleInfo
                        {
                            Name = moduleFolder.Name,
                            Assembly = assembly,
                            Path = moduleFolder.FullName
                        });
                    }
                }
            }

            GlobalConfiguration.Modules = modules;
            return services;
        }

        public static IServiceCollection AddCustomizedMvc(this IServiceCollection services, IList<ModuleInfo> modules,
            IConfiguration configuration, IHostingEnvironment hostingEnvironment)
        {
            var mvcBuilder = services
                .AddMvc()
                .AddRazorOptions(o =>
                {
                    foreach (var module in modules)
                    {
                        o.AdditionalCompilationReferences.Add(
                            MetadataReference.CreateFromFile(module.Assembly.Location));
                    }
                });

            foreach (var module in modules)
            {
                // Register controller from modules to main web host
                mvcBuilder.AddApplicationPart(module.Assembly);

                // Register dependency in modules
                var moduleInitializerType =
                    module.Assembly.GetTypes().FirstOrDefault(x => typeof(IModuleInitializer).IsAssignableFrom(x));
                if ((moduleInitializerType != null) && (moduleInitializerType != typeof(IModuleInitializer)))
                {
                    var moduleInitializer = (IModuleInitializer)Activator.CreateInstance(moduleInitializerType);
                    moduleInitializer.Init(services);
                }
            }

            var builder = new ContainerBuilder();
            foreach (var module in GlobalConfiguration.Modules)
            {
                builder.RegisterAssemblyTypes(module.Assembly).AsImplementedInterfaces();
            }

            builder.RegisterInstance(configuration);
            builder.RegisterInstance(hostingEnvironment);
            builder.Populate(services);

            var container = builder.Build();
            container.Resolve<IServiceProvider>();

            return services;
        }

        public static IServiceCollection InjectApplicationServices(this IServiceCollection services)
        {
            services.AddUrlHelper();
            
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();

            services.AddScoped<IQueueService, QueueService>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            services.AddTransient<IUnitOfWork, UnitOfWork>();
            services.AddTransient<IUrlHelperExtension, UrlHelperExtension>();
            services.AddTransient<IPostOptionsRepository, PostOptionsRepository>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IAccountRepository, AccountRepository>();
            services.AddTransient<IEmailSender, EmailSender>();
            services.AddTransient<IExceptionHandler, ExceptionHandler>();

            return services;
        }

        public static IServiceCollection AddCustomizedDataStore(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDbContextPool<ApplicationDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly("AwesomeCMSCore")).UseOpenIddict());

            return services;
        }

        public static IServiceCollection AddCustomAuthentication(this IServiceCollection services)
        {
            services
                .AddIdentity<User, ApplicationRole>(options =>
                {
                    options.Password.RequireDigit = false;
                    options.Password.RequiredLength = 4;
                    options.Password.RequireLowercase = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = false;

                    //lock out attempt
                    options.Lockout.AllowedForNewUsers = true;
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                    options.Lockout.MaxFailedAccessAttempts = 3;
                })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            //The default value is 14 days.
            services.ConfigureApplicationCookie(options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromHours(1);
            });

            // Configure Identity to use the same JWT claims as OpenIddict instead
            // of the legacy WS-Federation claims it uses by default (ClaimTypes),
            // which saves you from doing the mapping in your authorization controller.
            services.Configure<IdentityOptions>(options =>
            {
                options.ClaimsIdentity.UserNameClaimType = OpenIdConnectConstants.Claims.Name;
                options.ClaimsIdentity.UserIdClaimType = OpenIdConnectConstants.Claims.Subject;
                options.ClaimsIdentity.RoleClaimType = OpenIdConnectConstants.Claims.Role;
            });

            // Register the OpenIddict services.
            services.AddOpenIddict(options =>
            {
                // Register the Entity Framework stores.
                options.AddEntityFrameworkCoreStores<ApplicationDbContext>();

                // Register the ASP.NET Core MVC binder used by OpenIddict.
                // Note: if you don't call this method, you won't be able to
                // bind OpenIdConnectRequest or OpenIdConnectResponse parameters.
                options.AddMvcBinders();

                // Enable the token endpoint.
                options
                    .EnableTokenEndpoint("/connect/token")
                    .EnableAuthorizationEndpoint("/connect/authorize")
                    .EnableLogoutEndpoint("/connect/logout")
                    .EnableIntrospectionEndpoint("/connect/introspect")
                    .EnableUserinfoEndpoint("/connect/userinfo");

                // Enable the password and the refresh token flows.
                options.AllowPasswordFlow()
                    .AllowRefreshTokenFlow();

                // During development, you can disable the HTTPS requirement.
                options.DisableHttpsRequirement();

                // Enable scope validation, so that authorization and token requests
                // that specify unregistered scopes are automatically rejected.
                options.EnableScopeValidation();

                // Note: to use JWT access tokens instead of the default
                // encrypted format, the following lines are required:
                //
                options.AddEphemeralSigningKey();
                options.UseJsonWebTokens();

                //will change it to 120 when fix issue refresh flow not return refresh token
                options
                    .SetAccessTokenLifetime(TimeSpan.FromMinutes(60));
                //.SetRefreshTokenLifetime(TimeSpan.FromMinutes(60));
            });

            services.AddAuthentication();

            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

            services.AddAuthentication()
                 .AddJwtBearer(options =>
                 {
                     options.Authority = "http://localhost:5000/";
                     options.Audience = "resource_server";
                     options.RequireHttpsMetadata = false;
                     options.TokenValidationParameters = new TokenValidationParameters
                     {
                         NameClaimType = OpenIdConnectConstants.Claims.Subject,
                         RoleClaimType = OpenIdConnectConstants.Claims.Role
                     };
                 });

            return services;
        }

        public static IServiceCollection InjectAppConfig(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
            services.Configure<QueueSettings>(configuration.GetSection("QueueSettings"));

            return services;
        }

        public static IServiceCollection RegisterGzip(this IServiceCollection services)
        {
            services.Configure<GzipCompressionProviderOptions>(options =>
                options.Level = System.IO.Compression.CompressionLevel.Optimal);
            services.AddResponseCompression(options =>
            {
                options.MimeTypes = new[]
                {
                    // Default
                    "text/plain",
                    "text/css",
                    "application/javascript",
                    "text/html",
                    "application/xml",
                    "text/xml",
                    "application/json",
                    "text/json",
                    // Custom
                    "image/svg+xml",
                    "font/woff2",
                    "application/font-woff",
                    "application/font-ttf",
                    "application/font-eot",
                    "image/jpeg",
                    "image/png"
                };
            });

            return services;
        }

        public static IServiceCollection IntegrateSwagger(this IServiceCollection services)
        {
            // Register the Swagger generator, defining one or more Swagger documents
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info
                {
                    Version = "v1",
                    Title = "Awesome CMS Core API V1",
                    Contact = new Contact { Name = "Tony Hudson", Email = "", Url = "https://github.com/ngohungphuc" }
                });

                c.SwaggerDoc("v2", new Info
                {
                    Version = "v2",
                    Title = "Awesome CMS Core API V2",
                    Contact = new Contact { Name = "Tony Hudson", Email = "", Url = "https://github.com/ngohungphuc" }
                });

                c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
            });

            return services;
        }

        public static IServiceCollection ConfigApiVersioning(this IServiceCollection services)
        {
            services.AddApiVersioning(options =>
            {
                options.ReportApiVersions = true;
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.DefaultApiVersion = new ApiVersion(1, 0);
            });

            return services;
        }
    }
}