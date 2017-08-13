﻿using System;
using Engine.DataTypes;
using Engine.Drivers.Context;
using FSharpUtils.Newtonsoft;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Tweek.ApiService.NetCore.Security;

namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("api/v1/context")]
    public class ContextController : Controller
    {
        private readonly IContextDriver _contextDriver;
        private readonly CheckWriteContextAccess _checkAccess;

        public ContextController(IContextDriver contextDriver, JsonSerializer serializer, CheckWriteContextAccess checkAccess)
        {
            _contextDriver = contextDriver;
            _checkAccess =checkAccess;
        }

        [HttpPost("{identityType}/{*identityId}")]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Forbidden)]
        public async Task<ActionResult> AppendContext([FromRoute] string identityType, [FromRoute] string identityId, [FromBody] Dictionary<string, JsonValue> data)
        {
            if (!_checkAccess(User, new Identity(identityType, identityId))) return Forbid();
            if (data.Count == 0) return Ok();

            var identity = new Identity(identityType, identityId);
            await _contextDriver.AppendContext(identity, data);
            return Ok();
        }

        [HttpDelete("{identityType}/{identityId}/{*prop}")]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Forbidden)]
        public async Task<ActionResult> DeleteFromContext([FromRoute] string identityType, [FromRoute] string identityId, [FromRoute] string prop)
        {
            if (!_checkAccess(User, new Identity(identityType, identityId))) return Forbid();
            var identity = new Identity(identityType, identityId);
            await _contextDriver.RemoveFromContext(identity, prop);
            return Ok();
        }

        [HttpGet("{identityType}/{identityId}")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult> GetContext([FromRoute] string identityType, [FromRoute] string identityId)
        {
            if (!User.IsTweekIdentity()) return Forbid();

            var identity = new Identity(identityType, identityId);
            var contextData = await _contextDriver.GetContext(identity);
            return Json(contextData);
        }
    }
}
