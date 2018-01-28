using GeoAPI.Geometries;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using log4net;

namespace MapService.Components.MapExport
{

    public class MapExportCallback
    {
        public Image image { get; set; }
        public string layerName { get; set; }
    }


    public class MapImageCreator
    {
        static ILog _log = LogManager.GetLogger(typeof(MapImageCreator));
        /// <summary>
        /// Create a worldfile for georeferencing.
        /// </summary>
        /// <param name="filename"></param>
        /// <param name="exportItem"></param>
        public static byte[] CreateWorldFile(MapExportItem exportItem)
        {                        
            double left = exportItem.bbox[0];
            double right = exportItem.bbox[1];
            double bottom = exportItem.bbox[2];
            double top = exportItem.bbox[3];                  
            /*
            Line 1: A: pixel size in the x-direction in map units/pixel
            Line 2: D: rotation about y-axis
            Line 3: B: rotation about x-axis
            Line 4: E: pixel size in the y-direction in map units, almost always negative[3]
            Line 5: C: x-coordinate of the center of the upper left pixel
            Line 6: F: y-coordinate of the center of the upper left pixel
            */
            double mapWidth = Math.Abs(left - right);
            double mapHeight = Math.Abs(top - bottom);
            double pixelSizeX = mapWidth / exportItem.size[0];
            double pixelSizeY = (-1) * (mapHeight / exportItem.size[1]);
            double x = exportItem.bbox[0];
            double y = exportItem.bbox[3];

            MemoryStream memoryStream = new MemoryStream();
            TextWriter textWriter = new StreamWriter(memoryStream);

            textWriter.WriteLine(pixelSizeX.ForceDecimalPoint());
            textWriter.WriteLine(0);
            textWriter.WriteLine(0);
            textWriter.WriteLine(pixelSizeY.ForceDecimalPoint());
            textWriter.WriteLine(x.ForceDecimalPoint());
            textWriter.WriteLine(y.ForceDecimalPoint());

            textWriter.Flush();
            memoryStream.Flush();

            byte[] bytes = memoryStream.ToArray();

            memoryStream.Close();
            textWriter.Close();

            return bytes;
        }

        /// <summary>
        /// Creates an image to export.
        /// </summary>
        /// <param name="exportItem"></param>
        /// <param name="fileinfo"></param>
        /// <returns>Image</returns>
        public static Image GetImage(MapExportItem exportItem)
        {
            _log.Debug("GetImage");
            MapExporter mapExporter = new MapExporter(exportItem);

            _log.Debug("GetImage2");
            mapExporter.AddWMTSLayers(exportItem.wmtsLayers);
            _log.Debug("GetImage3");
            mapExporter.AddWMSLayers(exportItem.wmsLayers);
            _log.Debug("GetImage4");
            mapExporter.AddArcGISLayers(exportItem.arcgisLayers);
            _log.Debug("GetImage5");
            mapExporter.AddVectorLayers(exportItem.vectorLayers);
            _log.Debug("GetImage6");

            double left = exportItem.bbox[0];
            double right = exportItem.bbox[1];
            double bottom = exportItem.bbox[2];
            double top = exportItem.bbox[3];

            _log.Debug("GetImage7");
            Envelope envelope = new Envelope(left, right, bottom, top);
            _log.Debug("GetImage8");
            mapExporter.map.ZoomToBox(envelope);
            _log.Debug("GetImage9");

            Image i = mapExporter.map.GetMap(exportItem.resolution);
            _log.Debug("GetImage10");

            Bitmap src = new Bitmap(i);
            _log.Debug("GetImage11");
            src.SetResolution(exportItem.resolution, exportItem.resolution);
            _log.Debug("GetImage12");

            Bitmap target = new Bitmap(src.Size.Width, src.Size.Height);
            _log.Debug("GetImage13");
            target.SetResolution(exportItem.resolution, exportItem.resolution);
            _log.Debug("GetImage14");

            Graphics g = Graphics.FromImage(target);
            _log.Debug("GetImage15");
            g.FillRectangle(new SolidBrush(Color.White), 0, 0, target.Width, target.Height);
            _log.Debug("GetImage16");
            g.DrawImage(src, 0, 0);
            _log.Debug("GetImage17");
            return target;
        }        

    }
}
