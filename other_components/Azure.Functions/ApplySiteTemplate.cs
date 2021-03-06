using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.SharePoint.Client;
using Office365Groups.Library;
using OfficeDevPnP.Core.Framework.Provisioning.Connectors;
using OfficeDevPnP.Core.Framework.Provisioning.ObjectHandlers;
using OfficeDevPnP.Core.Framework.Provisioning.Providers.Xml;
using Microsoft.Online.SharePoint.TenantAdministration;

namespace Rederi.Functions
{
    public static class ApplySiteTemplate
    {
        [FunctionName("ApplySiteTemplate")]
        public static HttpResponseMessage Run([HttpTrigger(AuthorizationLevel.Function, "post", Route = null)]HttpRequestMessage req, ExecutionContext executionContext, TraceWriter log)
        {
            var siteUrl = req.GetParam("siteUrl");
            var templateName = req.GetParam("template");
            var siteOrderUrl = req.GetParam("siteOrderUrl");
            var themeName = req.GetParam("themeName");

            if(string.IsNullOrEmpty(siteUrl) || string.IsNullOrEmpty(templateName)) throw new ArgumentException("siteUrl or template cannot be empty");

            var path = executionContext.FunctionDirectory;
            var pathToFolder = Path.GetFullPath(Path.Combine(path, @"..\Files\"));

            //We need a stupid FileSystemConnector to be able to get hold of the files declared in the Files node.
            var fileSystemConnector = new FileSystemConnector(pathToFolder, string.Empty);

            var templateProvider = new XMLFileSystemTemplateProvider
            {
                Connector = fileSystemConnector
            };

            ProvisioningTemplateApplyingInformation pti = new ProvisioningTemplateApplyingInformation();

            var template = templateProvider.GetTemplate(templateName);
            template.Connector = fileSystemConnector;


            // Apply PnP template
            try
            {
                using (var clientContext = AuthHelper.GetAppOnlyAuthenticatedContext(siteUrl))
                {
                    var list = clientContext.Web.GetListByTitle("Documents") ??
                               clientContext.Web.GetListByTitle("Dokumenter");
                    


                    var defaultView = list.DefaultView;
                    clientContext.Load(defaultView);
                    clientContext.ExecuteQuery();
                    template.Parameters["SiteOrderUrl"] = siteOrderUrl.ToString();

                    clientContext.Web.ApplyProvisioningTemplate(template, pti);
                }
            }
            catch (Exception e)
            {
                var errorMessage = string.Format($"Failed to apply template {templateName} on site {siteUrl}: {e.Message}");
                log.Error($"Failed to apply template {templateName} on site {siteUrl}: {e.Message}", e, e.Source);
                return req.CreateErrorResponse(HttpStatusCode.InternalServerError, errorMessage);
            }

            // Apply theme
            try
            {
                using (var tenantContext = AuthHelper.GetTenantAdminClientContext())
                {

                    var tenant = new Tenant(tenantContext);

                    tenant.SetWebTheme(themeName.ToString(), siteUrl);
                    tenantContext.ExecuteQueryRetry();

                }
            }
            catch (Exception e)
            {
                var errorMessage = string.Format($"Failed to apply theme {themeName} on site {siteUrl}: {e.Message}");
                log.Error($"Failed to apply template {themeName} on site {siteUrl}: {e.Message}", e, e.Source);
                return req.CreateErrorResponse(HttpStatusCode.InternalServerError, errorMessage);
            }

            // Fetching the name from the path parameter in the request URL
            return req.CreateResponse(HttpStatusCode.OK, "Template applied: " + templateName + ". Theme applied: " + themeName);
        }

        private static string GetParam(this HttpRequestMessage req, string name)
        {
            string param = req.GetQueryNameValuePairs()
                .FirstOrDefault(q => String.Compare(q.Key, name, StringComparison.OrdinalIgnoreCase) == 0)
                .Value;

            return param;
        }
    }
}
